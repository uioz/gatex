import { prefixToPort } from "../../common/remote-branch.mjs";
export function mountService(app, manifestManager, appManager, worker, config) {
    app.get("/api/service", (req, res) => {
        const result = [];
        for (const label of appManager.apps) {
            result.push({
                label,
                type: "app",
            });
        }
        for (const [label, url] of Object.entries(manifestManager.manifest)) {
            result.push({
                label,
                url,
                type: "api",
            });
        }
        res.json(result);
    });
    function isValidRequestQuery(data) {
        if (data && data.url) {
            return true;
        }
        return false;
    }
    app.post("/api/service/api/:prefix", async (req, res) => {
        const { prefix } = req.params;
        const parsedUrl = new URL(isValidRequestQuery(req.query)
            ? req.query.url
            : `http://${req.ip}:${prefixToPort(prefix, config.server.portBottomLine)}`);
        if (isValidRequestQuery(req.query)) {
            if (parsedUrl.port.length === 0) {
                parsedUrl.port =
                    prefixToPort(prefix, config.server.portBottomLine) + "";
            }
        }
        await manifestManager.flushManifest({
            ...manifestManager.manifest,
            [prefix]: parsedUrl.toString(),
        });
        await worker.restart();
        return res.sendStatus(200);
    });
    app.post("/api/service/app/:target", async (req, res) => {
        const { target } = req.params;
        await appManager.add(req, target);
        await worker.restart();
        res.sendStatus(200);
    });
    app.post("/api/service/app/clone/:source/:target", async (req, res) => {
        const { source, target } = req.params;
        await appManager.clone(source, target);
        await worker.restart();
        res.sendStatus(200);
    });
    app.delete("/api/service/api/:target", async (req, res) => {
        const { target } = req.params;
        if (target in manifestManager.manifest) {
            delete manifestManager.manifest[target];
            await manifestManager.flushManifest(manifestManager.manifest);
            await worker.restart();
            return res.sendStatus(200);
        }
        return res.sendStatus(404);
    });
    function isValidDeleteQuery(data) {
        return typeof data?.all === "boolean";
    }
    app.delete("/api/service/app/:target", async (req, res) => {
        const { target } = req.params;
        if (isValidDeleteQuery(req.query)) {
            await Promise.all(Array.from(appManager.apps)
                .filter((appName) => appName.startsWith(target))
                .map((appName) => appManager.delete(appName)));
            await worker.restart();
            return res.sendStatus(200);
        }
        if (appManager.apps.has(target)) {
            await appManager.delete(target);
            await worker.restart();
            return res.sendStatus(200);
        }
        return res.sendStatus(404);
    });
}
