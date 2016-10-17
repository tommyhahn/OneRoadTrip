'use strict';
var Q = require('q');
var _ = require('lodash');
var Spots = require('mongoose').model('Spot');
var ObjectId = require('mongoose').Types.ObjectId;
var printObj = function(obj) {
	console.log(JSON.stringify(obj));
};

var MAX_DAILY_HOURS = 6;
exports.getSpots = function(req, res) {

  if(!req.body.city_id || !req.body.total_days) {
    return res.status(400).send({message: 'Wrong request format for api/plan'});
  }

	var spotsList = [];
  var selected_tag = '';
  if(req.body.selected_tag) {
    selected_tag = req.body.selected_tag;//'商务';
  }
	var candidateSpotMap = {};
	var retObj = {};
	Spots.find({'city_id': new ObjectId(req.body.city_id )}).exec(function(err, collection) {
     		//spotsList = collection.slice().sort(sortSpotsByScore);
     		reflushArray(spotsList, collection.slice().sort(sortSpotsByScore));
     		printObj('20',spotsList);
    }).then(planSpots.bind(this, spotsList, candidateSpotMap, req.body.total_days, selected_tag))
    .then(transformToRetFromat.bind(this,candidateSpotMap, req.body.total_days, retObj))
    .then(addUnuse.bind(this, retObj, candidateSpotMap, spotsList))
    .then(function() {
    	res.send(retObj);
    });	
};

var reflushArray = function(targetArr, srcArr) {
  while(targetArr.length > 0) {
      targetArr.pop();
  };
  srcArr.forEach(function(obj){
    targetArr.push(obj);
  });
};

//base on the map  it will convert the format to the following:
// {'day1' :[spot1, spot2], 'day2' :[spot5, spot3]}
var transformToRetFromat = function(candidateSpotMap, totalDays, retObj) {
  retObj['plan'] = [];
	for(var i =0;i<totalDays;i++) {
		retObj['plan'].push([]);
	}
	for(var key in candidateSpotMap) {
		if(candidateSpotMap.hasOwnProperty(key)){
			var spot = candidateSpotMap[key];
			retObj['plan'][spot.day-1].push(spot);
		}
	}

};

// add unused spots to retObj
var addUnuse = function(retObj, candidateSpotMap, spotsList) {
  retObj['unused_spots'] = [];
  spotsList.forEach(function(spot) {
    if(!candidateSpotMap.hasOwnProperty(spot._id.toString())){
      retObj['unused_spots'].push(spot);
    }
  });
};

var planSpots = function(spotsList, candidateSpotMap, totalDays, selected_tag) {
	console.log('planSpots begin , totalDays', totalDays);
	console.log('spotsList length', spotsList.length);
	for(var i=0;i<totalDays; i++) {
		planOneDaySpots(spotsList, candidateSpotMap, i+1, selected_tag)
	}
	//printObj(candidateSpotMap);
};

var planOneDaySpots = function(spotsList, candidateSpotMap, day, selected_tag) {
		console.log('planOneDaySpots begin');
	var totalHour = MAX_DAILY_HOURS;
	while(totalHour >0) {
		var nextSpot = getOneAvailableSpot(spotsList, totalHour, day, 
										   selected_tag, candidateSpotMap);
		if(nextSpot == null) break;
		totalHour -= nextSpot.hour;
	}
};

var getOneAvailableSpot = function(spotsList, leftHour, day, 
								   selected_tag, candidateSpotMap) {
	console.log('getOneAvailableSpot begin', spotsList.length);
	for(var i =0;i<spotsList.length;i++) {
		var curSpot = spotsList[i];
		if(selected_tag !='' && curSpot.tag.indexOf(selected_tag) <0) {
			continue;
		}
		if(candidateSpotMap.hasOwnProperty(curSpot._id.toString())) {
			continue;
		}
		if(curSpot.hour>leftHour) {
			continue;
		}
		curSpot['day'] = day;
		candidateSpotMap[curSpot._id.toString()] = curSpot;
		return curSpot;
	}
	return null;
};
var sortSpotsByScore = function(spot1, spot2) {
	// if same score get the big spot first
	if(spot2.score == spot1.score) {
		return spot2.hour - spot1.hour
	}
	return spot2.score - spot1.score;
}