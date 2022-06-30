import ejs from 'ejs';
import {type Express} from 'express';
import {join} from 'path';
import {cwd} from 'process';

const CONFIG_VIEWS_PATH = join(cwd(), './public/server');

/**
 *
 */
export function mountConfigPage(app: Express, appNames: Array<string>) {
  app.engine('.html', (ejs as any).__express);
  app.set('views', CONFIG_VIEWS_PATH);
  app.set('view engine', 'html');

  app.use((req, res, next) => {
    if (!req?.cookies?.gatex || req.query.gatex === 'true') {
      return res.render('index', {
        appNames,
      });
    }

    next();
  });
}
