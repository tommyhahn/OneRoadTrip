'use strict';

import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: '{PATH} is required!',
  },
  featured: {
    type: Boolean,
    required: '{PATH} is required!',
  },
  published: {
    type: Date,
    required: '{PATH} is required!',
  },
  tags: [String],
});

courseSchema.statics.createDefaultCourses = function createDefaultCourses() {
  this.find()
  .exec((err, collection) => {
    if (err) throw new Error(err);

    if (collection.length === 0) {

    }
  });
};

export default {
  schema: courseSchema,
  key: 'Course',
};
