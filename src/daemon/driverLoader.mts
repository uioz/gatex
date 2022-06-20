// TODO: 后面设计成为读取目录后加载
import Gitlab from "../drivers/gitlab.mjs";
import { type AppManager } from "../common/apps.mjs";
import { type ManifestManager } from "../common/manifest.mjs";
import { type Worker } from "./worker.mjs";
import { argv } from "process";
import debug from "debug";

export function load(
  appManager: AppManager,
  manifestManager: ManifestManager,
  worker: Worker
) {
  new Gitlab(manifestManager, appManager, worker, debug).run(argv.slice(2));
}
