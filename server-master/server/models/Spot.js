'use strict';

import mongoose from 'mongoose';
import _ from 'lodash';

const spotSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  city_id: {
    type: mongoose.Schema.ObjectId,
  },
  hour: {
    type: String,
  },
  score: {
    type: Number,
  },
  tag: {
    type: String,
  },
});

spotSchema.statics.createDefaultSpots = function createDefaultSpots(cities) {
  return this.find()
  .exec((err, collection) => {
    if (err) throw new Error(err);

    const promises = [];
    if (collection.length === 0) {
      const jsons = require('./Spot.json');

      _.each(jsons, json => {
        const city = _.filter(cities, city => {
          return json.city_name === city.name;
        });

        promises.push(this.create({
          name: json.name,
          city_id: city[0].id,
          hour: json.hour,
          score: json.score,
          tag: json.topic,
        }));
      });
      return Promise.all(promises)
      .then(() => {
        return cities;
      });
    }

    return cities;
  })

  // TODO: exec returns database collection which is not the same as cities
  .then(() => {
    return cities;
  });
};

export default {
  schema: spotSchema,
  key: 'Spot',
};
