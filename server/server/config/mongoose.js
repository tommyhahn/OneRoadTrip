'use strict';

import config from 'config.js';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import {debugWrapper} from 'services/debug-wrapper.js';

const debug = debugWrapper(__filename);

function initModels() {
  const modelsDir = path.resolve(__dirname, '../models');

  fs.readdirSync(modelsDir)
  .forEach(file => {
    if (file[0] === '.') return;
    if (!/\.js$/.test(file)) return;

    const filePath = path.resolve(modelsDir, file);
    const model = require(filePath).default;
    if (!model.key || !model.schema) return;

    // if already sourced don't overwrite it
    try {
      mongoose.model(model.key);
    } catch (_) {
      mongoose.model(model.key, model.schema);
      debug(`sourcing ${model.key}`);
    }
  });
}

function connect() {
  return new Promise((resolve, reject) => {
    mongoose.connect(config.mongo.url, e => {
      if (e) reject(e);
      resolve();
    });
  });
}

export function start() {
  mongoose.Promise = Promise;
  return connect()
  .then(initModels)
  // TODO: remove this logic later, move into a one off script
  .then(() => {
    const cityModel = mongoose.model('City');
    const spotModel = mongoose.model('Spot');
    const guideModel = mongoose.model('Guide');
    const cityConnectionsModel = mongoose.model('CityConnections');

    return cityModel.createDefaultCities()
    .then(cities => spotModel.createDefaultSpots(cities))
    .then(cities => guideModel.createDefaultGuides(cities))
    .then(cities => cityConnectionsModel.createDefaultCityConnections(cities));
  });
}

export function stop() {
  return new Promise((resolve, reject) => {
    mongoose.disconnect(e => {
      if (e) reject(e);
      resolve();
    });
  });
}

// VERY DANGEROUS, USE AT YOUR OWN RISK
export function veryDangerousOperationDropDb() {
  return mongoose.connection.db.dropDatabse();
}
