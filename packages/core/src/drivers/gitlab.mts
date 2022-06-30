import {type AppManager} from '../common/apps.mjs';
import {type ManifestManager} from '../common/manifest.mjs';
import {type Worker} from '../daemon/worker.mjs';
import {type Debugger, type Debug} from 'debug';
import {readApiPrefixFromRemoteBranch} from './remote-branch.mjs';

export default class Gitlab {
  private log: Debugger;

  constructor(
    private manifestManager: ManifestManager,
    private appManager: AppManager,
    private worker: Worker,
    private debug: Debug
  ) {
    this.log = debug('gitlab');
  }

  /**
   * "PROJECT_NAME@HOST@PROJECT_ID@ACCESS_TOKEN"
   * @example
   * run('http://192.168.0.1@123@xxxxxx')
   * @param args
   */
  run(args: Array<string>) {
    if (args.length === 0) {
      this.log('no args stop running');
      return;
    }

    const map = new Map<
      string,
      Array<{
        host: string;
        projectId: string;
        accessToken: string;
      }>
    >();

    for (const [project, host, projectId, accessToken] of args.map((arg) => arg.split('@'))) {
      const temp = {
        host,
        projectId,
        accessToken,
      };

      if (map.get(project)?.push(temp) === undefined) {
        map.set(project, [temp]);
      }
    }

    setInterval(async () => {
      this.log('running');

      const tasks: Array<Promise<[string, Array<string>]>> = [];

      for (const [project, subs] of map.entries()) {
        for (const {accessToken, host, projectId} of subs) {
          tasks.push(
            (async () => {
              return [project, await readApiPrefixFromRemoteBranch(host, projectId, accessToken)];
            })()
          );
        }
      }

      for await (const [project, suffixes] of tasks) {
        for (const suffix of suffixes) {
          if (this.manifestManager.has(project, suffix)) {
            delete this.manifestManager.manifest[project][suffix];
            this.log(`delete api ${project}@${suffix}`);

            await this.appManager.wildDelete(project, suffix);
            this.log(`delete app ${project}@${suffix}`);
          }
        }
      }

      await this.manifestManager.flushManifest(this.manifestManager.manifest);

      await this.worker.restart();
    }, 1000 * 60 * 60 * 24); // 1 day
  }
}
