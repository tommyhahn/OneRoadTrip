'use strict';
var https = require('https');
var Q = require('q');
var _ = require('lodash');
var User = require('mongoose').model('User');
var Cities = require('mongoose').model('City');
var CityConnections = require('mongoose').model('CityConnections');
var cnt=0;
var cityConnections = [];
var citiesNameIdMapping = [];
var cityIdList = [];
var cityObjList = [];
var cityOrder = [];
var minTripLen = 90000000;
var nearByCityRadius = 500000;
var transportDayItemId='';
exports.getPlan = function(req, res) {
 // initCityConnection(res);

 var cityList = ['San Francisco', 'Sacramento','Seattle', 'Los Angels', "San Jose"];
  /* 
  [ '56ad83ba904eef6489a77826': 'Los Angels',
  '56ad83ba904eef6489a7782b': 'Sacramento',
  '56ad83ba904eef6489a7782c': 'San Francisco',
  '56ad83ba904eef6489a7782e': 'Seattle',
  '56ad83ba904eef6489a77842': 'San Jose' ]
 
 
  cityIdList = [ '56ad83ba904eef6489a77826',// 'Los Angels',
  '56ad83ba904eef6489a7782b',// 'Sacramento',
  '56ad83ba904eef6489a7782c',// 'San Francisco',
  '56ad83ba904eef6489a77842',// 'San Jose',
  '56ad83ba904eef6489a7782e'];// 'Seattle' ]
*/


  if (!req.body.city || !req.body.start_date || !req.body.end_date 
     || !req.body.hotel || !req.body.num_people || !req.body.num_room ) {
    return res.status(400).send({message: 'Wrong request format for api/plan'});
  }
  cityIdList = req.body.city;
  console.log(cityIdList);
  cityObjList = [];
  var totalDays = getDiffDays(req.body.start_date, req.body.end_date);
  Cities.find({}).exec(function(err, collection) {
     collection.forEach(function(city) {
      if(cityIdList.indexOf(city._id.toString()) >=0) {
        cityObjList.push(city);
      }
      if(city.name =='Transport') {
        transportDayItemId = city._id.toString();
        cityObjList.push(city);
      }
    });
  })
  .then(loadRelatedCityConnections)
  .then(planRoute.bind(this, res, cityObjList))
  .then(planDays.bind(this, cityObjList, totalDays,res, req));
};

var getDiffDays = function(startDate, endDate) {
  var msDay = 1000*60*60*24;
  return Math.floor((endDate - startDate) / msDay);
};

var planDays = function(cityObjList, totalDays, res, req) {
  var curTotal =0;
  var curMax = 0;
  var curMin = 0;
  cityObjList.forEach(function(city) {
    city['allocate_days'] = city.recommand_day;
    curTotal += city.recommand_day;
    curMax += city.max_day;
    curMin += city.min_day;
  });

  if(curMax < totalDays) {
    // return cityList;
    cityObjList.forEach(function(city) {
      city['allocate_days'] = city.max_day;
    });
    return sendCityPlanResult(cityObjList, cityOrder, res, req, 'warning: max days is less than total days');
  }
  if(curMin > totalDays) {
    cityObjList.forEach(function(city) {
      city['allocate_days'] = city.min_day;
    });
    console.log("curMin and total", curMin, totalDays);
    // return cityList;
    return sendCityPlanResult(cityObjList, cityOrder, res, req, 'warning: min days is greater than total days');
  }
  console.log('debug curTotal totalDays', curTotal, totalDays);
  while(curTotal<totalDays) {
    curTotal ++;
    cityObjList.sort(sortCompareMaxDay);
    cityObjList[0].allocate_days++;
  }
  console.log('debug curTotal totalDays2', curTotal, totalDays);
  while(curTotal>totalDays) {
    curTotal--;
    cityObjList.sort(sortCompareMinDay);
    cityObjList[0].allocate_days--;
  }
  console.log('debug curTotal totalDays3', curTotal, totalDays);


  return sendCityPlanResult(cityObjList, cityOrder, res, req, 'successful');
};

var getDateOffset = function(baseDate, offset){
  var result = new Date(baseDate);
  result.setDate(result.getDate() + offset);
  return result.getTime();
}
var sendCityPlanResult = function(cityObjList, cityOrder, res, req, msg) {
  var ret = {};
  ret.status = msg;
  ret.city_plan = [];
  ret.start_date = req.body.start_date;
  ret.end_date = req.body.end_date;
  ret.hotel = req.body.hotel;
  ret.num_people = req.body.num_people;
  ret.num_room = req.body.num_room;
  ret.selected_tag = req.body.selected_tag;
  console.log("127");
  var offsetDay = 0;
  cityOrder.forEach(function(city){
    var obj = {};
    obj['id'] = city;
    var allocate_days = getCityObjById(cityObjList, city).allocate_days;
    obj['allocate_days'] = allocate_days;
    obj['start_date'] = getDateOffset(ret.start_date, offsetDay);
    obj['end_date'] = getDateOffset(ret.start_date, offsetDay + allocate_days);
    offsetDay += allocate_days;
    ret.city_plan.push(obj);
  });
  // start and end are the same;
  if(ret.city_plan < 2) {
    return res.status(400).send({message: 'unknow error, city cnt less than 2!'});
  }
  else if(ret.city_plan[0].id.toString() == 
    ret.city_plan[ret.city_plan.length-1].id.toString()) {
    ret.city_plan[0].allocate_days;
    ret.city_plan[ret.city_plan.length-1].allocate_days = 0;
  }
  //get near by city list
  var nearByCityIdList = [];
  cityOrder.forEach(function(city_id) {
    var curNearByList = getNearByCities(city_id, cityOrder,
                                        cityConnections, nearByCityRadius);
    nearByCityIdList = _.union(nearByCityIdList,curNearByList);
  });
  nearByCityIdList.sort(function(a,b) {
      return a.distance - b.distance;
  });

  ret["sugguest_cities"] = [];
  nearByCityIdList.forEach(function(city){
    ret["sugguest_cities"].push(city.city_id);  
  });
  ret["sugguest_cities"] = _.uniq(ret["sugguest_cities"]);
  res.send(ret);
  return;
}
var getCityObjById = function(cityObjList, id) {
   var city = _.filter(cityObjList, function(city){
                          return city._id.toString()== id;
                      });
   console.log(id);
   return city[0];
}
var sortCompareMaxDay = function(city1, city2) {
  return (city2.max_day - city2.allocate_days) 
        - (city1.max_day - city1.allocate_days);
}
var sortCompareMinDay = function(city1, city2) {
  return (city2.allocate_days - city2.min_day) 
        - (city1.allocate_days - city1.min_day);
}

var addTransportDay = function(cityList, cityObjList) {
  console.log('addTransportDay begin');
  var len = cityList.length;
  var i = 1;
  while(i<len) {
    var lastCity = getCityObjById(cityObjList, cityList[i-1]);
    var curCity = getCityObjById(cityObjList, cityList[i]);
    if(lastCity.region != curCity.region) {
      cityList.splice(i, 0, transportDayItemId);
      i++;
    }
    i++;
  }
};
var planRoute = function(res, cityObjList){
  console.log('planRoute begin');
  var ret = [];
  var path = [];
  var visitedCities ={};
  minTripLen = 90000000;
  //getRouteLen(cityIdList, path, cityConnections);

  dfsCities(ret, path, visitedCities, cityIdList, cityConnections);
  // add start and end city
  ret.unshift(cityIdList[0]);
  ret.push(cityIdList[cityIdList.length-1]);
  addTransportDay(ret, cityObjList);
  reflushArray(cityOrder, ret);
  //res.send(cityOrder);
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
var reflushArray = function(targetArr, srcArr) {
  while(targetArr.length > 0) {
      targetArr.pop();
  };
  srcArr.forEach(function(obj){
    targetArr.push(obj);
  });
}
var dfsCities = function(ret, path, visitedCities, cities, cityConnections) {
  // the first and last city is fixed, when we do the permutation, we do not need include them

 // console.log('path',path);
  if(path.length == cities.length - 2) {
    var tripLen = getRouteLen(cities, path, cityConnections);
     console.log(tripLen,minTripLen);
    if(tripLen < minTripLen) {
      reflushArray(ret, path.slice());
      minTripLen = tripLen;
    }
  }
  for (var i=1; i<cities.length -1; i++) {
    if (visitedCities[cities[i]] != undefined && visitedCities[cities[i]]) continue;
   
    path.push(cities[i]);

    visitedCities[cities[i]] = true;
    dfsCities(ret, path, visitedCities, cities, cityConnections);
    visitedCities[cities[i]] = false;
    path.pop();
  }
};

var getRouteLen = function(cities, path, cityConnections) {
  console.log('getRouteLen begin');
  if(cities.length < 2 || path.length == 0) {
    return 0;
  }
  var totalLen = getEdgeLen(cities[0], path[0], cityConnections);
  for(var i =0;i<path.length -1;i++ ){
    totalLen += getEdgeLen(path[i], path[i+1], cityConnections);
  }
  totalLen += getEdgeLen(cities[0], path[path.length -1], cityConnections);
  return totalLen;
}
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

var getNearByCities = function(curCity_id, cityIdList, cityConnections, radius) {
  console.log("getNearByCities begin");
    var nearby_cities = [];
    cityConnections.forEach(function(cityMapping) {  
      if(cityMapping.fromCityId.toString() == curCity_id && cityMapping.distance <= radius) {
        if(cityIdList.indexOf(cityMapping.toCityId.toString()) < 0) { // not in the exsiting list
          nearby_cities.push({"city_id":cityMapping.toCityId.toString(), "distance":cityMapping.distance});
        }
      }
    });
    return nearby_cities;
};


var getDistance = function(fromCity, toCity, arr) {
  var apiHost = 'https://maps.googleapis.com';
    var apiPath = '/maps/api/distancematrix/json?origins=' 
             + fromCity.replace(' ','+') + '&destinations=' + toCity.replace(' ','+') + '&key=AIzaSyDIHVw94G4DADCEQ4rbtTcOrZfMD9SqRGI';
    var defer = Q.defer();
    https.get(apiHost + apiPath, function(res) {
       res.on('data', function(d) {
         //process.stdout.write(d);
         var parsed = JSON.parse(d);
        // console.log(fromCity +'|' + toCity);
        var dis = 3000000;
         if(!parsed.rows[0] || !parsed.rows[0].elements[0].distance){
          dis = 3000000;
         }
         else {
          dis = parsed.rows[0].elements[0].distance.value;
         }
       //  console.log(dis);
       var obj = {'fromCity' : fromCity, 'toCity': toCity, 'distance':dis};
       arr.push(obj);
       console.log(cnt++);
       defer.resolve(d);
     });
  });
  return defer.promise; 
};
var initCityConnection = function(res) {
   var apiHost = 'https://maps.googleapis.com';
    var fromCity = 'Seattle';
    var toCity = 'San+Francisco';
    var cityList = ['San Diego',
        'Los Angels',
        'Las Vegas',
        'Phoenix',
        'Salt Lake City',
        'Reno',
        'Sacramento',
        'San Francisco',
        'Portland',
        'Seattle',
        'Vancouvor',
        'Chicago',
        'New York',
        'Washington',
        'Philadelphia',
        'Boston',
        'Miami',
        'Atlanta',
        'Orlando',
        'Houston',
        'Denver',
        'New Orleans',
        'Hawaii',
        'Columbus',
        'Niagara Fall',
        'Dallas',
        'Lake Tahoe',
        'Yosemite',
        'Yellowstone',
        'San Jose'];
  var mypromise = [];
  var retArr = [];
   for(var i = 0;i<cityList.length ; i++) {
      for(var j = 0;j<cityList.length ; j++) {
        if(i==j) continue;
        if(i < 15)continue;
        fromCity = cityList[i];
        toCity = cityList[j];
        mypromise.push(getDistance(fromCity, toCity, retArr));
      }
   }

   Q.all(mypromise).then(function(result){

     for(var i = 0; i<retArr.length; i++) {
      console.log(retArr[i]);
     }
      res.send(retArr);
   });
}