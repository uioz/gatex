import { readApiPrefixFromRemoteBranch } from "./remote-branch.mjs";
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
        this.log = debug("gitlab");
    }
    /**
     * "HOST@PROJECT_ID@ACCESS_TOKEN"
     * @example
     * run('http://192.168.0.1@123@xxxxxx')
     * @param args
     */
    run(args) {
        if (args.length === 0) {
            this.log("no args stop running");
            return;
        }
        setInterval(async () => {
            this.log("running");
            const set = new Set();
            for await (const branches of args.map((target) => readApiPrefixFromRemoteBranch(target))) {
                for (const branch of branches) {
                    set.add(branch);
                }
            }
            this.log(`these labels ${[...set]} are matched branch-based pattern`);
            for (const key of Object.keys(this.manifestManager.manifest)) {
                if (!set.has(key)) {
                    delete this.manifestManager.manifest[key];
                    this.log(`delete manifest[${key}]`);
                }
            }
            await this.manifestManager.flushManifest(this.manifestManager.manifest);
            for (const app of this.appManager.apps) {
                // extract dev from dev@official
                // extract dev from dev
                const [prefix] = app.split("@");
                if (!set.has(prefix)) {
                    await this.appManager.delete(app);
                    this.log(`delete app ${app}`);
                }
            }
            await this.worker.restart();
        }, 1000 * 60 * 60 * 24); // 1 day
    }
}
