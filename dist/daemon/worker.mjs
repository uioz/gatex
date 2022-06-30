import { execaNode } from 'execa';
import { stderr, stdout, stdin } from 'process';
import debug from 'debug';
const log = debug('Worker');
function createWorker() {
    const abortController = new AbortController();
    const cprocess = execaNode('./dist/server.mjs', {
        signal: abortController.signal,
        stderr,
        stdin,
        stdout,
    });
    return {
        abortController,
        cprocess,
    };
}
export var State;
(function (State) {
    State[State["start"] = 0] = "start";
    State[State["running"] = 1] = "running";
    State[State["stop"] = 2] = "stop";
})(State = State || (State = {}));
export class Worker {
    #state = State.stop;
    #cprocess = null;
    #abortController = null;
    get state() {
        return this.#state;
    }
    set state(v) {
        this.#state = v;
        log(`worker is ${State[v]}`);
    }
    start() {
        const { abortController, cprocess } = createWorker();
        this.state = State.start;
        cprocess.once('spawn', () => (this.state = State.running));
        this.#abortController = abortController;
        this.#cprocess = cprocess;
    }
    stop() {
        return new Promise((resolve, reject) => {
            this.#cprocess?.catch((error) => {
                if (error.isCanceled && this.#cprocess?.killed) {
                    resolve(undefined);
                }
                else {
                    reject(error);
                }
                this.state = State.stop;
            });
            this.#abortController?.abort();
        });
    }
    async restart() {
        if (this.state !== State.stop) {
            await this.stop();
        }
        this.start();
    }
}
