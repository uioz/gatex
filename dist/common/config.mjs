import { readFile } from 'fs/promises';
import { cwd } from 'process';
import { join } from 'path';
export async function loadConfig() {
    return JSON.parse(await readFile(join(cwd(), 'config/config.json'), {
        encoding: 'utf-8',
    }));
}
