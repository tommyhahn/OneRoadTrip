;(function() {
'use strict';

angular.module('app.shared')
    .service('ApiInterceptor', [
        '$rootScope',
        'AUTH_EVENTS',
        ApiInterceptorFactory
    ]);

function ApiInterceptorFactory($rootScope, AUTH_EVENTS) {
    var service = this;

    service.request = function(config) {
        // config.headers['X-Auth-Token'] = (Token.token)? Token.token.id : '';
        // config.headers['Access-Control-Allow-Origin'] = '*';
        // config.headers['Access-Control-Allow-Headers'] = 'Origin, content-type, accept, authorization';
        // config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, HEAD';        
        // config.headers['Access-Control-Allow-Credentials'] = 'true';
        // console.log(config);
        return config;
    };

    service.requestError = function(config) {
        return config;
    };

    service.response = function(res) {
        return res;
    };

    service.responseError = function(response) {
        var rejection;

        switch(response.status) {
            case 401: {
                // if the error is to a definition call and user is not an admin let it slide
                // so it doesn't go to the catch block in the promise chain

                $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                rejection = response;
                break;
            }

            case 400: {
                if (!response) {
                    response.data = {};
                    response.data.message = 'Invalid Config';
                }
                    rejection = response;
                break;
            }

        //     case 404: {

        //         // TODO: remove this block
        //         // 404 should not contain response.data
        //         // Even if it did, it should not log user out
        //         // Unauthorized calls should have a 401 status
        //         // if (response.data) {
        //         //     $rootScope.$broadcast('unauthorized');
        //         //     response.data = {};
        //         //     response.data.message = 'Invalid Login';
        //         // }

        //         rejection = response;
        //         break;
        //     }

        //     case 0: {
        //         response.data = {};
        //         response.data.message = 'Invalid Address';
        //         rejection = response;
        //         break;
        //     }
        }

        return Q.reject(rejection);
    };
}

}());
