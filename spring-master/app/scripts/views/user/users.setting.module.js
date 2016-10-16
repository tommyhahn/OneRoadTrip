;(function() {
'use strict';

angular.module('views.users', [])
.config([
    '$stateProvider',
    viewsUserConfig
]);

function viewsUserConfig($stateProvider) {
    // parent view
    $stateProvider.state('user', {
        url: '/user',
        templateUrl: 'scripts/views/user/user.tpl.html',
        controller: 'UserCtrl',
        resolve: {
            UserData:  function($http, Controller, $cookieStore, User) {
               return $http.get(Controller.base() + 'api/user_info')
                        .then (function (res) {
                            console.log(res);
                            // User.order = res.data.order;
                            return res.data;
                        })
                }
        },

    });

    $stateProvider.state('user.info', {
        url: '/info',
        templateUrl: 'scripts/views/user/info/info.tpl.html',
        controller: 'InfoCtrl'
    });


    $stateProvider.state('user.booking', {
        url: '/booking',
        templateUrl: 'scripts/views/user/booking/booking.tpl.html',
        controller: 'BookingCtrl'
    });

    $stateProvider.state('user.order', {
        url: '/order',
        templateUrl: 'scripts/views/user/order/order.tpl.html',
        controller: 'OrderCtrl'
    });

}

}());
