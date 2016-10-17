'use strict';

var passport = require('passport');

exports.authenticate = function(req, res, next) {
  if(!req.body.username) {
    return res.status(400).send({message: '用户名不能为空'});
  }
  if(!req.body.password) {
    return res.status(400).send({message: '密码不能为空'});
  }

  // req.body.username = req.body.username.toLowerCase();
  var auth = passport.authenticate('local', function(err, user) {
    console.log("user", user);
    if(err) {return next(err);}
    if(!user) { res.status(400).send({success: false, message:'登陆失败'})}
    req.logIn(user, function(err) {
      if(err) {return next(err);}
      // res.send({success:true, user: user});
      res.json({username: user.username});
    })
  })
  auth(req, res, next);
};

exports.requiresApiLogin = function(req, res, next) {
  if(!req.isAuthenticated()) {
    res.status(401);
    res.end();
  } else {
    next();
  }
};

exports.requiresRole = function(role) {
  return function(req, res, next) {
    if(!req.isAuthenticated() || req.user.roles.indexOf(role) === -1) {
      res.status(401);
      res.end();
    } else {
      next();
    }
  }
}