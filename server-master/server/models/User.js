'use strict';

import mongoose from 'mongoose';
import encrypt from '../utilities/encryption.js';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: '{PATH} is required!',
    unique: true,
  },
  email: {
    type: String,
    required: '{PATH} is required!',
    unique: true,
  },
  salt: {
    type: String,
    required: '{PATH} is required!',
  },
  hashed_pwd: {
    type: String,
    required: '{PATH} is required!',
  },
  roles: {
    type: String,
    default: 'user',
  },
});

userSchema.methods.authenticate = function authenticate(password) {
  return encrypt.hashPwd(this.salt, password) === this.hashed_pwd;
};

export default {
  schema: userSchema,
  key: 'User',
};
