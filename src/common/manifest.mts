import { readFile, writeFile } from "fs/promises";
import { cwd } from "process";
import { join } from "path";
import debug from "debug";
import { Config } from "./config.mjs";

const log = debug("ManifestManager");

export interface Manifest {
  [project: string]: {
    [api: string]: {
      url: string;
    };
  };
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

export function getFallbackUrl(config: Config, manifest: Manifest) {
  const [project, prefix] = config.server.fallbackPrefix.split("@");

  return () => manifest[project][prefix].url;
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

  public classifyManifest() {
    const result: Array<{
      label: string;
      url: string;
      project: string;
      type: "api";
    }> = [];

    for (const [project, value] of Object.entries(this.manifest)) {
      for (const [label, { url }] of Object.entries(value)) {
        result.push({
          project,
          label,
          url,
          type: "api",
        });
      }
    }

    return result;
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
  }

  public async update(project: string, api: string, payload: { url: string }) {
    const temp = {
      [api]: {
        ...payload,
        createdAt: Date.now(),
      },
    };

    if (this.manifest[project]) {
      Object.assign(this.manifest[project], temp);
    } else {
      this.manifest[project] = temp;
    }

    return this.flushManifest(this.manifest);
  }

  public async delete(project: string, api: string) {
    delete this.manifest[project][api];
    return this.flushManifest(this.manifest);
  }

  public getMainfestByProject(project: string) {
    return this.manifest[project];
  }

  public getMainfest() {
    return this.manifest;
  }

  public has(project: string, api: string) {
    return !!this.manifest[project]?.[api];
  }
}
