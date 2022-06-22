import { createProxyMiddleware } from "http-proxy-middleware";
import { log } from "./log.mjs";
export function mountApis(app, manifest, config, getFallbackUrl) {
    app.use(config.server.passthroughPrefixes, createProxyMiddleware({
        ws: true,
        changeOrigin: true,
        router(req) {
            const [project, api] = req.cookies.gatex.split("@");
            if (!manifest[project]?.[api].url) {
                log(`${project}@${api} not found, using fallback`);
            }
            return manifest[project]?.[api].url ?? getFallbackUrl();
        },
    }));
}
