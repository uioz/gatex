import { cwd } from "process";
import { type ReadStream } from "fs";
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

export function joinName(appName: string) {
  return join(WWW_ROOT, appName);
}

export class AppManager {
  public apps: Set<string> = new Set();

  async init() {
    try {
      await mkdir(WWW_ROOT);
    } catch (error) {
      if ((error as any)?.code !== "EEXIST") {
        throw error;
      }
    }
    this.apps = new Set(await readAppNameFromHostDir());
    log(this.apps);
    log("init success");
  }

  classifyApp() {
    const result: Array<{
      project: string;
      label: string;
      type: "app";
    }> = [];

    for (const app of this.apps) {
      const [project, api, channel] = app.split("@");

      result.push({
        project,
        label: channel ? `${api}@${channel}` : api,
        type: "app",
      });
    }

    return result;
  }

  async clone(source: string, target: string) {
    await cp(join(WWW_ROOT, source), join(WWW_ROOT, target), {
      recursive: true,
    });
    this.apps.add(target);
  }

  async wildDelete(project: string): Promise<void>;
  async wildDelete(project: string, api: string): Promise<void>;
  async wildDelete(
    project: string,
    api: string,
    channel: string
  ): Promise<void>;
  async wildDelete(project: string, api?: string, channel?: string) {
    const filterText = [project, api, channel]
      .filter((item) => item !== undefined)
      .join("@");

    await Promise.all(
      Array.from(this.apps)
        .filter((app) => app.startsWith(filterText))
        .map((app) =>
          (async () => {
            await rm(join(WWW_ROOT, app), {
              recursive: true,
              force: true,
            });
            this.apps.delete(app);
          })()
        )
    );
  }

  async delete(target: string) {
    await rm(join(WWW_ROOT, target), {
      recursive: true,
      force: true,
    });
    this.apps.delete(target);
  }

  add(input: ReadStream, project: string, target: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = input.pipe(
        Extract({
          path: join(WWW_ROOT, `${project}@${target}`),
        })
      );
      stream.once("close", () => {
        this.apps.add(`${project}@${target}`);
        resolve();
      });
      stream.once("error", (error) => {
        log(error);
        reject();
      });
    });
  }
}
