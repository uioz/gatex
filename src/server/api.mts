import { type Express } from "express";
import { type Manifest } from "../common/manifest.mjs";
import { type Config } from "../common/config.mjs";
import { createProxyMiddleware } from "http-proxy-middleware";

export function mountApis(app: Express, manifest: Manifest, config: Config) {
  app.use(
    "/api",
    createProxyMiddleware({
      ws: true,
      changeOrigin: true,
      router(req) {
        const prefix = req.cookies.gatex.split("@")[0];

        return manifest[prefix] ?? manifest[config.server.fallbackPrefix];
      },
    })
  );
}
