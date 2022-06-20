import { type Express } from "express";
import { type Manifest } from "../common/manifest.mjs";
import { type Config } from "../common/config.mjs";
import { createProxyMiddleware } from "http-proxy-middleware";
import { log } from "./log.mjs";

export function mountApis(app: Express, manifest: Manifest, config: Config) {
  app.use(
    config.server.passthroughPrefixes,
    createProxyMiddleware({
      ws: true,
      changeOrigin: true,
      router(req) {
        const prefix = req.cookies.gatex.split("@")[0];

        if (!manifest[prefix]) {
          log(`${prefix} not found, using fallback`);
        }

        return manifest[prefix] ?? manifest[config.server.fallbackPrefix];
      },
    })
  );
}
