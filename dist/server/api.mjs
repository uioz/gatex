import { createProxyMiddleware } from "http-proxy-middleware";
import { log } from "./log.mjs";
export function mountApis(app, manifest, config) {
    app.use("/api", createProxyMiddleware({
        ws: true,
        changeOrigin: true,
        router(req) {
            const prefix = req.cookies.gatex.split("@")[0];
            if (!manifest[prefix]) {
                log(`${prefix} not found, using fallback`);
            }
            return manifest[prefix] ?? manifest[config.server.fallbackPrefix];
        },
    }));
}
