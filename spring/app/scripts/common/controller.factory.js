;(function() {
'use strict';

angular.module('app.shared')
    .factory('Controller', [
    '$resource',
    '$http',
    ControllerFactory
]);

/**
 * ControllerFactory Definition
 */
function ControllerFactory($resource, $http) {

    function Controller(){
        // Controller properties
        // Defines the url associated with the controller
        this.persistentData = {
            scheme: 'http',
            host: 'localhost',
            // host: '106.184.1.83', //xiaofeng
            // host:'54.213.193.97', //yipeng
            port: '3004',
            prefix: '',
            version: 'v1.0'
        };

    }


    /**
     * @returns {String} - Compiled url
     */
    Controller.prototype.base = function() {
        return this.persistentData.scheme + '://'
            + this.persistentData.host + ':'
            + this.persistentData.port + '/';
    };


    /**
     * @returns {String} - Simple url with only protocol + host
     */
    Controller.prototype.simpleBase = function() {
        return this.persistentData.scheme + '://'
         + this.persistentData.host;
    };


    return new Controller();
}

}());
