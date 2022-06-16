import ejs from "ejs";
import { join } from "path";
import { cwd } from "process";
const CONFIG_VIEWS_PATH = join(cwd(), "./public/server");
/**
 *
 */
export function mountConfigPage(app, appNames) {
    app.engine(".html", ejs.__express);
    app.set("views", CONFIG_VIEWS_PATH);
    app.set("view engine", "html");
    app.use((req, res, next) => {
        if (!req?.cookies?.gatex || req.query.gatex === "true") {
            return res.render("index", {
                appNames,
            });
        }
        next();
    });
}
