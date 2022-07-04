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
    portBaseline;
    /**
     * 服务配置
     */
    manifest = {};
    usedPorts = [];
    constructor(portBaseline) {
        this.portBaseline = portBaseline;
    }
    async flushManifest(manifest) {
        await writeManifest(manifest);
        this.manifest = manifest;
        this.scanPorts();
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
    scanPorts() {
        const temps = [];
        for (const project of Object.keys(this.manifest)) {
            for (const api of Object.keys(this.manifest[project])) {
                const port = Number.parseInt(new URL(this.manifest[project][api].url).port) - this.portBaseline;
                temps[port] = port;
            }
        }
        this.usedPorts = temps;
    }
    getFreePort() {
        const len = this.usedPorts.length;
        let index = 0;
        while (index < len) {
            const result = this.usedPorts[index];
            if (result === undefined) {
                return index + this.portBaseline;
            }
            index++;
        }
        throw new Error('port exceeds');
    }
    async init() {
        try {
            const manifest = await readManifest();
            this.manifest = manifest;
            this.scanPorts();
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
