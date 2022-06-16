import { cwd } from "process";
import { readdir, cp, rm, mkdir } from "fs/promises";
import { join } from "path";
import { Extract } from "unzipper";
import debug from "debug";
const log = debug("AppManager");
export const WWW_ROOT = join(cwd(), "./www");
export async function readAppNameFromHostDir() {
    const result = await readdir(WWW_ROOT, {
        withFileTypes: true,
    });
    return result
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);
}
export function joinName(appName) {
    return join(WWW_ROOT, appName);
}
export class AppManager {
    apps = new Set();
    async init() {
        try {
            await mkdir(WWW_ROOT);
        }
        catch (error) {
            if (error?.code !== "EEXIST") {
                throw error;
            }
        }
        this.apps = new Set(await readAppNameFromHostDir());
        log(this.apps);
        log("init success");
    }
    async clone(source, target) {
        await cp(join(WWW_ROOT, source), join(WWW_ROOT, target), {
            recursive: true,
        });
        this.apps.add(target);
    }
    async delete(target) {
        await rm(join(WWW_ROOT, target), {
            recursive: true,
            force: true,
        });
        this.apps.delete(target);
    }
    add(input, target) {
        return new Promise((resolve, reject) => {
            const stream = input.pipe(Extract({
                path: join(WWW_ROOT, target),
            }));
            stream.once("close", () => {
                this.apps.add(target);
                resolve();
            });
            stream.once("error", (error) => {
                log(error);
                reject();
            });
        });
    }
}
