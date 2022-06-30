// https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#ecmascript-module-support-in-node-js
import express from 'express';
import cookieParser from 'cookie-parser';
import { readAppNameFromHostDir, joinName } from './common/apps.mjs';
import { readManifest, getFallbackUrl } from './common/manifest.mjs';
import { loadConfig } from './common/config.mjs';
import { mountConfigPage } from './server/configPage.mjs';
import { mountApis } from './server/api.mjs';
import { mountRedirect } from './server/redirect.mjs';
import { log } from './server/log.mjs';
const APP_NAMES = await readAppNameFromHostDir();
const MANIFEST = await readManifest();
const CONFIG = await loadConfig();
const Server = express();
Server.use(cookieParser());
mountConfigPage(Server, APP_NAMES);
mountApis(Server, MANIFEST, CONFIG, getFallbackUrl(CONFIG, MANIFEST));
mountRedirect(Server);
// host statics
for (const appName of APP_NAMES) {
    Server.use(`/${appName}`, express.static(joinName(appName), {
        maxAge: Number.MAX_SAFE_INTEGER,
        redirect: false,
    }));
}
Server.listen(CONFIG.server.port, () => log(`gatex server is running!`));
