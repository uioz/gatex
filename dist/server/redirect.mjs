import { WWW_ROOT } from "../common/apps.mjs";
import { join } from "path";
import { log } from "./log.mjs";
export function mountRedirect(app) {
    app.use((req, res, next) => {
        const prefix = req.cookies.gatex;
        if (req.url.lastIndexOf(".") > req.url.lastIndexOf("/")) {
            req.url = `/${prefix}${req.url}`;
            return next();
        }
        log(`${req.url} -> /${prefix}/index.html`);
        res.sendFile(join(WWW_ROOT, `/${prefix}/index.html`), {
            cacheControl: false,
            lastModified: false,
        });
    });
}
