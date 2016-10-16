 'use strict';

var passport = require('passport'),
    mongoose = require('mongoose'),
    LocalStrategy = require('passport-local').Strategy,
    User = mongoose.model('User');

module.exports = function() {
    passport.use(new LocalStrategy(
        function(username, password, done) {
            User.findOne({username:username}).exec(function(err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, { message: '用户名不存在.' });
                }
                if (!user.authenticate(password)) {
                    return done(null, false, { message: '密码错误.' });
                }
                return done(null, user);
            })
        }
    ));

    passport.serializeUser(function(user, done) {
        if(user) {
            done(null, user._id);
        }
    });


    passport.deserializeUser(function(id, done) {
        User.findOne({_id:id}).exec(function(err, user) {
            if(user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
    })

}
