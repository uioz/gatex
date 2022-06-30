import express from 'express';
import {loadConfig} from './common/config.mjs';
import {ManifestManager} from './common/manifest.mjs';
import {AppManager} from './common/apps.mjs';
import {Worker} from './daemon/worker.mjs';
import {cwd} from 'process';
import {join} from 'path';
import {mountService} from './daemon/api/service.mjs';
import {log} from './daemon/log.mjs';
import {load} from './daemon/driverLoader.mjs';

const manifestManager = new ManifestManager();
const worker = new Worker();
const appManager = new AppManager();

const [CONFIG] = await Promise.all([loadConfig(), manifestManager.init(), appManager.init()]);

worker.start();

const App = express();

mountService(App, manifestManager, appManager, worker, CONFIG);

load(appManager, manifestManager, worker);

App.use(express.static(join(cwd(), 'public/daemon')));

App.listen(CONFIG.daemon.port, () => log(`gatex daemon is listening at ${CONFIG.daemon.port}`));
