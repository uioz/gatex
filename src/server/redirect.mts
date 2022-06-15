import { type Express } from "express";
import { WWW_ROOT } from "../common/apps.mjs";
import { join } from "path";

export function mountRedirect(app: Express) {
  app.use((req, res, next) => {
    const prefix = req.cookies.gatex;

    if (req.url.lastIndexOf(".") > req.url.lastIndexOf("/")) {
      req.url = `/${prefix}${req.url}`;
      return next();
    }

    res.sendFile(join(WWW_ROOT, `/${prefix}/index.html`), {
      cacheControl: false,
      lastModified: false,
    });
  });
}
