import { readApiPrefixFromRemoteBranch } from './remote-branch.mjs';
export default class Gitlab {
    manifestManager;
    appManager;
    worker;
    debug;
    log;
    constructor(manifestManager, appManager, worker, debug) {
        this.manifestManager = manifestManager;
        this.appManager = appManager;
        this.worker = worker;
        this.debug = debug;
        this.log = debug('gitlab');
    }
    /**
     * "PROJECT_NAME@HOST@PROJECT_ID@ACCESS_TOKEN"
     * @example
     * run('http://192.168.0.1@123@xxxxxx')
     * @param args
     */
    run(args) {
        if (args.length === 0) {
            this.log('no args stop running');
            return;
        }
        const map = new Map();
        for (const [project, host, projectId, accessToken] of args.map((arg) => arg.split('@'))) {
            const temp = {
                host,
                projectId,
                accessToken,
            };
            if (map.get(project)?.push(temp) === undefined) {
                map.set(project, [temp]);
            }
        }
        setInterval(async () => {
            this.log('running');
            const tasks = [];
            for (const [project, subs] of map.entries()) {
                for (const { accessToken, host, projectId } of subs) {
                    tasks.push((async () => {
                        return [project, await readApiPrefixFromRemoteBranch(host, projectId, accessToken)];
                    })());
                }
            }
            for await (const [project, suffixes] of tasks) {
                for (const suffix of suffixes) {
                    if (this.manifestManager.has(project, suffix)) {
                        delete this.manifestManager.manifest[project][suffix];
                        this.log(`delete api ${project}@${suffix}`);
                        await this.appManager.wildDelete(project, suffix);
                        this.log(`delete app ${project}@${suffix}`);
                    }
                }
            }
            await this.manifestManager.flushManifest(this.manifestManager.manifest);
            await this.worker.restart();
        }, 1000 * 60 * 60 * 24); // 1 day
    }
}
