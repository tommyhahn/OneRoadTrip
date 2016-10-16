'use strict';
var q = require('q');
var _ = require('lodash');
var GuideSchedule = require('mongoose').model('GuideSchedule');
var Guide = require('mongoose').model('Guide');
var ObjectId = require('mongoose').Types.ObjectId;
exports.getGuideSchedule = function(req, res) {
  GuideSchedule.find({}).exec(function(err, collection) {
      console.log(collection); 
    });
};

exports.bookGuide = function(req, res) {
  var guide_id = new ObjectId('56ad83ba904eef6489a77832');
  var book_date = new Date;
  var name = 'test_name';
  GuideSchedule.create({"guide_id":guide_id, "name": name, "date" : book_date, "booking_status" : "booked"});
  res.send('a');
};
exports.findGuide = function(req, res) {
  console.log('findGuide begin');
  var start_date = req.body.start_date;
  var end_date = req.body.end_date;
  var city_id = req.body.city_id;
  var city_plan = req.body.city_plan;
  var promise = [];
  console.log('findGuide 27');
  city_plan.forEach(function(city){
    city.sugguest_guide = [];
    promise.push(findGuideByCityId(city.start_date, city.end_date, city.id, city, "sugguest_guide", 5));
  });
  promise.push(findGuideByCityId(req.body.start_date, req.body.end_date, city_plan[0].id, req.body, "sugguest_oneguide", 10));

  q.all(promise).then(function(data){
    res.send(req.body);
  });
};
var findGuideByCityId = function(start_date, end_date, city_id, retObj, field_name, limit) {

  var unavailableGuideMap = {};
  return GuideSchedule.find({
    book_date: {
      $gte: start_date,
      $lt: end_date
    }}).exec(function(err, collection) {
      collection.forEach(function(guide_schedule){
        unavailableGuideMap[guide_schedule.guide_id.toString()] = true;
      });
      
    }).then(findGuideForCity.bind(this, unavailableGuideMap, city_id))
     .then(function(data) {
      retObj[field_name] = data.slice(0, limit);
    });
};

var findGuideForCity = function(unavailableGuideMap, city_id) {
    var deferred = q.defer();
    var guideList = [];
    Guide.find({"cover_city" :city_id}).exec(function(err, collection) {
    
      collection.forEach(function(guide) {

        if(!unavailableGuideMap.hasOwnProperty(guide._id.toString())) {
          guideList.push(guide);
        }
      });
      deferred.resolve(guideList);
    });
    
    return deferred.promise;
}

var yipengtest = function(res, guideList){
    console.log('yipengtest begin');

  res.send(guideList);
}