import { type Express } from "express";
import { type Manifest } from "../common/manifest.mjs";
import { type Config } from "../common/config.mjs";
import { createProxyMiddleware } from "http-proxy-middleware";
import { log } from "./log.mjs";

export function mountApis(
  app: Express,
  manifest: Manifest,
  config: Config,
  getFallbackUrl: () => string
) {
  app.use(
    config.server.passthroughPrefixes,
    createProxyMiddleware({
      ws: true,
      changeOrigin: true,
      router(req) {
        const [project, api] = req.cookies.gatex.split("@");

        if (!manifest[project]?.[api].url) {
          log(`${project}@${api} not found, using fallback`);
        }

        return manifest[project]?.[api].url ?? getFallbackUrl();
      },
    })
  );
}
