import { readFile, writeFile } from 'fs/promises';
import { cwd } from 'process';
import { join } from 'path';
import debug from 'debug';
const log = debug('ManifestManager');
export async function readManifest() {
    const data = await readFile(join(cwd(), 'config/manifest.json'), {
        encoding: 'utf-8',
    });
    return JSON.parse(data);
}
export async function writeManifest(config) {
    await writeFile(join(cwd(), 'config/manifest.json'), JSON.stringify(config), {
        encoding: 'utf-8',
        flag: 'w+',
    });
}
export function getFallbackUrl(config, manifest) {
    const [project, prefix] = config.server.fallbackPrefix.split('@');
    return () => manifest[project][prefix].url;
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
    classifyManifest() {
        const result = [];
        for (const [project, value] of Object.entries(this.manifest)) {
            for (const [label, { url }] of Object.entries(value)) {
                result.push({
                    project,
                    label,
                    url,
                    type: 'api',
                });
            }
        }
        return result;
    }
    async init() {
        try {
            const manifest = await readManifest();
            this.manifest = manifest;
            log('init success');
        }
        catch (error) {
            if (error?.code === 'ENOENT') {
                const data = {};
                await writeManifest(data);
                this.manifest = data;
                log('init success');
            }
            else {
                throw error;
            }
        }
    }
    async update(project, api, payload) {
        const temp = {
            [api]: {
                ...payload,
                createdAt: Date.now(),
            },
        };
        if (this.manifest[project]) {
            Object.assign(this.manifest[project], temp);
        }
        else {
            this.manifest[project] = temp;
        }
        return this.flushManifest(this.manifest);
    }
    async delete(project, api) {
        delete this.manifest[project][api];
        return this.flushManifest(this.manifest);
    }
    getMainfestByProject(project) {
        return this.manifest[project];
    }
    getMainfest() {
        return this.manifest;
    }
    has(project, api) {
        return !!this.manifest[project]?.[api];
    }
}
