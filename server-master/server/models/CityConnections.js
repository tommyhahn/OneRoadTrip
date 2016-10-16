'use strict';

import mongoose from 'mongoose';
import _ from 'lodash';

const cityConnectionsSchema = new mongoose.Schema({
  fromCityId: {
    type: mongoose.Schema.ObjectId,
    required: '{PATH} is required!',
  },
  toCityId: {
    type: mongoose.Schema.ObjectId,
    required: '{PATH} is required!',
  },
  distance: {
    type: Number,
    required: '{PATH} is required!',
  },
});

function getCityId(cities, name) {
  const city = _.filter(cities, city => city.name === name);
  return city[0].id;
}

cityConnectionsSchema.statics.createDefaultCityConnections = function(cities) {
  return this.find()
  .exec((err, collection) => {
    if (err) throw new Error(err);

    const promises = [];
    const jsons = require('./CityConnections.json');
    if (collection.length === 0) {
      _.each(jsons, json => {
        const fromCityId = getCityId(cities, json.fromCity);
        const toCityId = getCityId(cities, json.toCity);

        promises.push(this.create({
          fromCityId,
          toCityId,
          distance: json.distance,
        }));
      });
    }

    return promises;
  })
  .then(promises => {
    return Promise.all(promises)
    .then(() => {
      return cities;
    });
  });
};

export default {
  schema: cityConnectionsSchema,
  key: 'CityConnections',
};
