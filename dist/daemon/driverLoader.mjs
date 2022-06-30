// TODO: 后面设计成为读取目录后加载
import Gitlab from '../drivers/gitlab.mjs';
import { argv } from 'process';
import debug from 'debug';
export function load(appManager, manifestManager, worker) {
    new Gitlab(manifestManager, appManager, worker, debug).run(argv.slice(2));
}
