'use strict';

var City = require('mongoose').model('City');
var Guide = require('mongoose').model('Guide');
var Spot = require('mongoose').model('Spot');
var User = require('mongoose').model('User');

exports.getCities = function(req, res) {
  	City.find().exec(function(err, collection) {
    	res.send(collection);
  	})
};


exports.getGuides = function(req, res) {
  	Guide.find({}).exec(function(err, collection) {
    	res.send(collection);
 	})
};

exports.getSpots = function(req, res) {
    Spot.find({}).exec(function(err, collection) {
      res.send(collection);
  })
};

exports.getUsers = function(req, res) {
    User.find({}).exec(function(err, collection) {
      res.send(collection);
  })
};

exports.addGuide = function(req, res) {
	console.log(req.files);
	var obj = req.body;

	Guide.create(req.body, function(err, collection){
		res.send(collection);
	});
};

