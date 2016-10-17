'use strict';

import passport from 'passport';
import bodyParser from 'body-parser';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import cors from 'cors';

module.exports = function(app) {
  app.use(cors());
  app.use(logger('dev'));
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(session({
    secret: 'trip for you',
    // saved new sessions
    saveUninitialized: true,
    // do not automatically write
    resave: false,
  }));

  app.use(passport.initialize());
  app.use(passport.session());
};
