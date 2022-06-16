import { readFile, writeFile } from "fs/promises";
import { cwd } from "process";
import { join } from "path";
import debug from "debug";
const log = debug("ManifestManager");
export async function readManifest() {
    const data = await readFile(join(cwd(), "config/manifest.json"), {
        encoding: "utf-8",
    });
    return JSON.parse(data);
}
export async function writeManifest(config) {
    await writeFile(join(cwd(), "config/manifest.json"), JSON.stringify(config), {
        encoding: "utf-8",
        flag: "w+",
    });
}
export class ManifestManager {
    /**
     * 服务配置
     */
    manifest = {};
    /**
     * 服务仓库所有可用分支后缀
     */
    // public remotePrefix: Array<string> = [];
    async flushManifest(manifest) {
        await writeManifest(manifest);
        this.manifest = manifest;
    }
    async init() {
        try {
            const manifest = await readManifest();
            this.manifest = manifest;
            log("init success");
        }
        catch (error) {
            if (error?.code === "ENOENT") {
                const data = {};
                await writeManifest(data);
                this.manifest = data;
                log("init success");
            }
            else {
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
