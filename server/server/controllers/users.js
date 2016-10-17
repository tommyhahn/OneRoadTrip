'use strict';

var User = require('mongoose').model('User'),
    encrypt = require('../utilities/encryption');

exports.getUsers = function(req, res) {
    User.find({}).exec(function(err, collection) {
        res.send(collection);
    })
};

exports.getUserInfo = function(req, res) {
  User.find({}).exec(function(err, collection) {
    res.send(collection);
  });
};


exports.createUser = function(req, res, next) {
  var userData = req.body;
  if(!userData.username) {
    return res.status(400).send({message: '用户名不能为空'});
  }
  if(!userData.email) {
    return res.status(400).send({message: '邮箱不能为空'});
  }
  if(!userData.password) {
    return res.status(400).send({message: '密码不能为空'});
  }
  userData.username = userData.username.toLowerCase();
  userData.salt = encrypt.createSalt();
  userData.hashed_pwd = encrypt.hashPwd(userData.salt, userData.password);
  User.create(userData, function(err, user) {
    if(err) {
      if(err.toString().indexOf('E11000') > -1) {
        err = '用户名或邮箱已存在';
      }
      res.status(400);
      return res.send({message:err});
    }
    req.logIn(user, function(err) {
      if(err) {return next(err);}
      res.json({username: userData.username});
    })
  })
};

exports.updateUser = function(req, res) {
  var userUpdates = req.body;

  if(req.user._id != userUpdates._id && !req.user.hasRole('admin')) {
    res.status(403);
    return res.end();
  }

  req.user.email = userUpdates.email;
  req.user.username = userUpdates.username;
  if(userUpdates.password && userUpdates.password.length > 0) {
    req.user.salt = encrypt.createSalt();
    req.user.hashed_pwd = encrypt.hashPwd(req.user.salt, userUpdates.password);
  }
  req.user.save(function(err) {
    if(err) { res.status(400); return res.send({reason:err.toString()});}
    res.json({username: req.user.username});
  });
};
