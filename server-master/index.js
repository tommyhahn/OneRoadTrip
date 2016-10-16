'use strict';

// polyfill es6
require('babel-core/register')();

// enable root requires
require('app-module-path').addPath(__dirname);

// polyfill promise
global.Promise = require('rsvp').Promise;

var start = require('./server').start;
start();
