import { execaNode, type ExecaChildProcess } from "execa";
import { stderr, stdout, stdin } from "process";
import debug from "debug";

const log = debug('Worker');

function createWorker() {
  const abortController = new AbortController();
  const cprocess = execaNode("./dist/server.mjs", {
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

export enum State {
  start,
  running,
  stop,
}

export class Worker {
  #state: State = State.stop;
  #cprocess: ExecaChildProcess<string> | null = null;
  #abortController: AbortController | null = null;

  public get state(): State {
    return this.#state;
  }

  public set state(v: State) {
    this.#state = v;
    log(`worker is ${State[v]}`);
  }

  public start() {
    const { abortController, cprocess } = createWorker();

    this.state = State.start;

    cprocess.once("spawn", () => (this.state = State.running));

    this.#abortController = abortController;
    this.#cprocess = cprocess;
  }

  public stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.#cprocess?.catch((error) => {
        if (error.isCanceled && this.#cprocess?.killed) {
          resolve(undefined);
        } else {
          reject(error);
        }

        this.state = State.stop;
      });
      this.#abortController?.abort();
    });
  }

  public async restart() {
    if (this.state !== State.stop) {
      await this.stop();
    }
    this.start();
  }
}
