'use strict';
var q = require('q');
var _ = require('lodash');
var cityConnections = [];
var guide_per_day_rate = 350;
var per_mile_rate = 1.5;
var multi_city_rate = 100;
exports.getQuote = function(req, res) {
  console.log('getQuote begin');
  /*
  loadRelatedCityConnections().then(function(){
      var totalCost = 0;
      totalCost += calcGuideBaseRate(req);
      totalCost += calculateMileageCost(req.city_plan);
      if(req.guide_plan_type=='multi') {
        totalCost += calcGuideHotelRate(req);
      }
      res.send(totalCost/req.num_people);
  });
*/
};
var calculateMileageCost = function(city_plan) {
  var totalDistance = 0;
  var city_plan_filtered = _.filter(city_plan, function(cplan){
                          return cplan.city.region!=0;
                      });
  if(city_plan_filtered.length<2)return 0;
  for(var i = 1; i<city_plan_filtered.length; i++) {
    totalDistance += getEdgeLen(city_plan_filtered[i-1].city.id, city_plan_filtered[i].city.id, 
                                cityConnections);
  }
  return totalDistance * per_mile_rate;
};

var calcGuideHotelRate = function(req) {
  return getTotalDays(req.city_plan) * multi_city_rate;
};
var getTotalDays = function(startDate, endDate) {
  var one_day=1000*60*60*24;
  return (req.endDate - req.startDate)/one_day;
};
var calcGuideBaseRate = function(req) {
  return getTotalDays(req.city_plan) * guide_per_day_rate;
};
var loadRelatedCityConnections = function() {
  return CityConnections.find({}).exec(function(err, collection) {
    collection.forEach(function(cityMapping) {
      if(cityIdList.indexOf(cityMapping.fromCityId.toString()) >=0) {
        cityConnections.push(cityMapping);
      }
    })
   // console.log(JSON.stringify(cityConnections));
  });
};
var getEdgeLen = function(startCity, endCity, cityConnections) {
  
  var cityMapping = _.filter(cityConnections, function(city){
                          return city.fromCityId .toString()== startCity.toString() 
                                  && city.toCityId.toString() == endCity.toString();
                      });

  if(cityMapping.length>0) {
    // console.log('getEdgeLen', startCity, endCity, cityMapping[0].distance)
    return cityMapping[0].distance;  
  }
  
  else {
    console.log('error', startCity, endCity);
    return 90000000;
  }
};