'use strict';

import express from 'express';
import config from 'config.js';
import * as database from 'server/config/mongoose';
import {debugWrapper} from 'services/debug-wrapper.js';

const debug = debugWrapper(__filename);

export function start() {
  const app = express();

  database.start()
  .then(() => {
    require('./server/config/express')(app, config);
    require('./server/config/passport')();
    const initRoutes = require('./server/config/routes.js').default;
    initRoutes(app);

    app.listen(config.port, e => {
      console.log(config.port);
      if (e) throw new Error(e);
      debug(`server listening on port ${config.port}`);
    });
  });
}
