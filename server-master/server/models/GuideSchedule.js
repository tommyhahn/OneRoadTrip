'use strict';

import mongoose from 'mongoose';

const guideScheduleSchema = new mongoose.Schema({
  guide_id: {
    type: mongoose.Schema.ObjectId,
  },
  name: {
    type: String,
  },
  date: {
    type: Date,
  },
  expire_date: {
    type: Date,
  },
  booking_status: {
    type: String,
  },
});

export default {
  schema: guideScheduleSchema,
  key: 'GuideSchedule',
};
