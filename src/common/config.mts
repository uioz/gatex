import { readFile } from "fs/promises";
import { cwd } from "process";
import { join } from "path";

export interface Config {
  daemon: {
    port: number;
  };
  server: {
    port: number;
    fallbackPrefix: string;
    portBottomLine: number;
  };
}

export async function loadConfig() {
  return JSON.parse(
    await readFile(join(cwd(), "config/config.json"), {
      encoding: "utf-8",
    })
  ) as Config;
}
