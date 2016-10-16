'use strict';

const env = process.env.NODE_ENV || 'development';
const multer = require('multer');

const defaults = {
  debugTag: 'wei-server',
  port: process.env.PORT || 3004,
  redis: {
    host: '127.0.0.1',
    port: 6379,
    ttl: 60 * 60 * 24 * 7
  },
  mongo: {
    // url: 'mongodb://localhost/trip',
    url: 'mongodb://victor:victor@ds011389.mlab.com:11389/oneroadtrip',
  },
  storage: multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './public/images/uploads/');
    },
    filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now());
    }
  }),
};

const envOverwrites = {
  test: {
    port: 9123,
    mongo: {
      url: 'mongodb://docker.me/trip_testing',
    },
    redis: {
      host: '127.0.0.1',
      port: 6381,
      ttl: 60 * 60 * 24 * 7,
    },
  },
  production: {
    port: process.env.PORT || 80,
    mongo: {
      // url: 'mongodb://localhost/trip',
      url: 'mongodb://victor:victor@ds011389.mlab.com:11389/oneroadtrip',
    },
    redis: {
      host: 'localhost',
      port: 6379,
      ttl: 60 * 60 * 24 * 7,
    },
  },
};

export default {
  ...defaults,
  ...envOverwrites[env],
};
