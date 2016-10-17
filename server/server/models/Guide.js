'use strict';

import mongoose from 'mongoose';
import _ from 'lodash';

const guideSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String
  },
  tag: {
    type: String,
  },
  score: {
    type: Number,
  },
  max_person: {
    type: Number,
  },
  has_car: {
    type: Boolean,
  },
  phone: {
    type: String,
  },
  cover_city: {
    type: Array,
  },
  image_url: {
    type: String,
  },
  language: {
    type: String,
  },
  payment: {
    type: String,
  },
});

guideSchema.statics.createDefaultGuides = function createDefaultGuides(cities) {
  return this.find()
  .exec((err, collection) => {
    if (err) throw new Error(err);

    const promises = [];
    const jsons = require('./Guide.json');

    if (collection.length === 0) {
      _.each(jsons, json => {
        const cover_city = json.cover_city;
        let citi_ids = [];

        if (cover_city) {
          const cover_city_group = cover_city.split('|');
          citi_ids = _.map(cover_city_group, cover_city_single => {
            const city = _.filter(cities, city => {
              return city.alias.indexOf(cover_city_single) > -1;
            });
            return city[0].id;
          });
        }

        promises.push(this.create({
          name: json.Name,
          description: json.description,
          tag: json.tag,
          score: json.score,
          max_person: json.max_person,
          has_car: json.has_car,
          phone: json.phone,
          cover_city: citi_ids,
          image_url: json.image_url,
          language: json.language,
          payment: json.payment,
        }));
      });
    }

    return Promise.all(promises);
  })
  .then(() => {
    return cities;
  });
};

export default {
  schema: guideSchema,
  key: 'Guide',
};
