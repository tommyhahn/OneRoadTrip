'use strict';

import mongoose from 'mongoose';
import _ from 'lodash';

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: '{PATH} is required!',
  },
  cn_name: {
    type: String,
    required: '{PATH} is required!',
  },
  max_day: {
    type: Number,
  },
  min_day: {
    type: Number,
  },
  recommand_day: {
    type: Number,
  },
  region: {
    type: Number,
    required: '{PATH} is required!',
  },
  alias: {
    type: String,
  },
});

/*
 * Statics
 */

citySchema.statics.createDefaultCities = function createDefaultCities() {
  return this.find()
  .exec((err, collection) => {
    if (err) throw new Error(err);

    const promises = [];
    if (collection.length === 0) {
      const jsons = require('./City.json');

      _.each(jsons, json => {
        promises.push(this.create({
          name: json.name,
          cn_name: json.cn_name,
          max_day: json.max_day,
          min_day: json.min_day,
          recommand_day: json.recommand_day,
          region: json.Region,
          alias: json.alias,
        }));
      });

      Promise.all(promises)
      .then(() => {
        this.find()
        .exec((err, collection) => {
          if (err) throw new Error(err);
          return collection;
        });
      });
    }

    return collection;
  });
};

export default {
  schema: citySchema,
  key: 'City',
};
