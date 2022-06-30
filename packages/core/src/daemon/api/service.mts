import {type Express} from 'express';
import {ManifestManager} from '../../common/manifest.mjs';
import {type AppManager} from '../../common/apps.mjs';
import {type Config} from '../../common/config.mjs';
import {Worker} from '../worker.mjs';
import {prefixToPort} from '../../common/prefixToPort.mjs';

export function mountService(
  app: Express,
  manifestManager: ManifestManager,
  appManager: AppManager,
  worker: Worker,
  config: Config
) {
  // TODO: 标记默认环境
  interface ServiceItem {
    project: string;
    label: string;
    url?: string;
    type: 'app' | 'api';
  }

  app.get('/api/service', (req, res) => {
    res.json([
      ...appManager.classifyApp(),
      ...manifestManager.classifyManifest(),
    ] as Array<ServiceItem>);
  });

  interface QueryBody {
    /**
     * 不指定端口则根据接口 prefix 来决定
     */
    url: string;
  }

  function isValidRequestQuery(data: any): data is QueryBody {
    if (data && data.url) {
      return true;
    }

    return false;
  }

  app.post('/api/service/api/:project/:prefix', async (req, res) => {
    const {prefix, project} = req.params;

    let parsedUrl: URL;

    if (isValidRequestQuery(req.query)) {
      parsedUrl = new URL(req.query.url);
    } else {
      const ip = req.ip.startsWith('::ffff:') ? req.ip.substring(7) : req.ip;

      parsedUrl = new URL(
        `http://${ip}:${prefixToPort(prefix, config.server.portBottomLine) + ''}`
      );
    }

    await manifestManager.update(project, prefix, {
      url: parsedUrl.toString(),
    });

    await worker.restart();

    return res.sendStatus(200);
  });

  app.post('/api/service/app/:project/:target', async (req, res) => {
    const {target, project} = req.params;

    await appManager.add(req as any, project, target);

    await worker.restart();

    res.sendStatus(200);
  });

  app.post('/api/service/app/clone/:source/:target', async (req, res) => {
    const {source, target} = req.params;

    try {
      await appManager.clone(source, target);

      await worker.restart();
    } catch (error) {
      return res.sendStatus(500);
    }

    res.sendStatus(200);
  });

  app.delete('/api/service/api/:project/:target', async (req, res) => {
    const {project, target} = req.params;

    if (manifestManager.has(project, target)) {
      await manifestManager.delete(project, target);
      await worker.restart();
      return res.sendStatus(200);
    }

    return res.sendStatus(404);
  });

  interface DeleteApiQuery {
    all: boolean;
  }

  function isValidDeleteQuery(data: any): data is DeleteApiQuery {
    return data?.all === 'true';
  }

  app.delete('/api/service/app/:project/:target', async (req, res) => {
    const {project, target} = req.params;

    let deleted = false;

    if (isValidDeleteQuery(req.query)) {
      await appManager.wildDelete(project, target);
      deleted = true;
    }

    if (appManager.apps.has(`${project}@${target}`)) {
      await appManager.delete(`${project}@${target}`);
      deleted = true;
    }

    if (deleted) {
      await worker.restart();
      return res.sendStatus(200);
    }

    return res.sendStatus(404);
  });
}
