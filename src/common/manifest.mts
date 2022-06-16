import { readFile, writeFile } from "fs/promises";
import { cwd } from "process";
import { join } from "path";
import debug from "debug";

const log = debug("ManifestManager");

export interface Manifest {
  [key: string]: string;
}

export async function readManifest() {
  const data = await readFile(join(cwd(), "config/manifest.json"), {
    encoding: "utf-8",
  });

  return JSON.parse(data) as Manifest;
}

export async function writeManifest(config: Manifest) {
  await writeFile(join(cwd(), "config/manifest.json"), JSON.stringify(config), {
    encoding: "utf-8",
    flag: "w+",
  });
}

export class ManifestManager {
  /**
   * 服务配置
   */
  public manifest: Manifest = {};
  /**
   * 服务仓库所有可用分支后缀
   */
  // public remotePrefix: Array<string> = [];

  public async flushManifest(manifest: Manifest) {
    await writeManifest(manifest);
    this.manifest = manifest;
  }

  public async init() {
    try {
      const manifest = await readManifest();
      this.manifest = manifest;
      log("init success");
    } catch (error) {
      if ((error as any)?.code === "ENOENT") {
        const data = {};
        await writeManifest(data);
        this.manifest = data;
        log("init success");
      } else {
        throw error;
      }
    }

    // console.log(
    //   `store init -> prefixs from local file are ${Object.keys(manifest)}`
    // );

    // for (const host of Object.keys(manifest)) {
    //   if (remotePrefix.indexOf(host) === -1) {
    //     delete manifest[host];
    //   }
    // }
    // console.log(
    //   `store init -> deduplicated prefixs are ${Object.keys(manifest)}`
    // );

    // this.remotePrefix = remotePrefix;
  }
}
