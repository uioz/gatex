export function mountService(app, manifestManager, appManager, worker, config) {
    app.get('/api/service', (req, res) => {
        res.json([
            ...appManager.classifyApp(),
            ...manifestManager.classifyManifest(),
        ]);
    });
    function isValidRequestQuery(data) {
        if (data && data.url) {
            return true;
        }
        return false;
    }
    app.post('/api/service/api/:project/:prefix', async (req, res) => {
        const { prefix, project } = req.params;
        let parsedUrl;
        if (isValidRequestQuery(req.query)) {
            parsedUrl = new URL(req.query.url);
        }
        else {
            const ip = req.ip.startsWith('::ffff:') ? req.ip.substring(7) : req.ip;
            parsedUrl = new URL(`http://${ip}:${manifestManager.getFreePort()}`);
        }
        await manifestManager.update(project, prefix, {
            url: parsedUrl.toString(),
        });
        await worker.restart();
        return res.sendStatus(200);
    });
    app.post('/api/service/app/:project/:target', async (req, res) => {
        const { target, project } = req.params;
        await appManager.add(req, project, target);
        await worker.restart();
        res.sendStatus(200);
    });
    app.post('/api/service/app/clone/:source/:target', async (req, res) => {
        const { source, target } = req.params;
        try {
            await appManager.clone(source, target);
            await worker.restart();
        }
        catch (error) {
            return res.sendStatus(500);
        }
        res.sendStatus(200);
    });
    app.delete('/api/service/api/:project/:target', async (req, res) => {
        const { project, target } = req.params;
        if (manifestManager.has(project, target)) {
            await manifestManager.delete(project, target);
            await worker.restart();
            return res.sendStatus(200);
        }
        return res.sendStatus(404);
    });
    function isValidDeleteQuery(data) {
        return data?.all === 'true';
    }
    app.delete('/api/service/app/:project/:target', async (req, res) => {
        const { project, target } = req.params;
        let deleted = false;
        if (isValidDeleteQuery(req.query)) {
            await appManager.wildDelete(project, target);
            deleted = true;
        }
        if (appManager.apps.has(`${project}@${target}`)) {
            await appManager.delete(`${project}@${target}`);
            deleted = true;
        }
        if (deleted) {
            await worker.restart();
            return res.sendStatus(200);
        }
        return res.sendStatus(404);
    });
}
