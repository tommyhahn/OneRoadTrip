;(function() {
'use strict';

angular.module('app.shared')
    .factory('User', [
        '$rootScope',
        '$resource',
        '$state',
        '$cookies',
        '$cookieStore',
        'Controller',
        'AUTH_EVENTS',
        UserFactory
    ]);

function UserFactory($rootScope, $resource, $state, $cookies, $cookieStore, Controller, AUTH_EVENTS) {

    /**
     * Creates a new User
     * @constructor
     */
    function User() {
        // only these fields will be persisted
        this.persistentData = {
            token: '',
            loggedIn: false,
            username: '',
            email:'',
            user_info: {}
        };

        // // non persisted properties
        // this.currNode = undefined;
        // this.displayNodeLevels = [];

        // * set the auth token only use for {@link ApiService}
        // Token.token = this.persistentData.token;

        // // expire timer starts now
        // var timeout = this.persistentData.token.expires - Date.now();
        // this.expireTimer = timer(timeout, this.logout.bind(this));

        // load from local storage on init
        this.getFromLocalCookie();
    }

    User.prototype.getFromLocalCookie = function(){
        if($cookieStore.get('isLoggin') && $cookieStore.get('username')) {
            this.persistentData.loggedIn = $cookieStore.get('isLoggin');
            this.persistentData.username = $cookieStore.get('username');
        }
    };


    User.prototype.signup = function(auth) {
        var that = this;
        var deferred = Q.defer();
        $resource(Controller.base() + 'signup')
            .save(auth).$promise
            .then(function(res) {
                console.log(res);
                $cookieStore.put('username', res.username);
                // // $cookieStore.put('userimage', res.user_info.picture_url);
                $cookieStore.put('isLoggin', true);
                // that.persistentData.token = res.token;
                that.persistentData.loggedIn = true;
                that.persistentData.username = res.user_name;
                that.persistentData.user_info = res.user_info;
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                deferred.resolve(res);          
            })
            .catch(function(err){
                deferred.reject(err);
            });
        return deferred.promise;
    };

    /**
     * Log the user in, handle state of persistent token
     * Makes an post call to /auth_credentials with credentials, on success set the persistentData, and
     * starts a new expire timer
     *
     * @param {Object} auth
     * @param {String} auth.Username
     * @param {String} auth.Password
     */
    User.prototype.login = function(auth) {
        var that = this;
        var deferred = Q.defer();
        
        $resource(Controller.base() + 'login')
            .save(auth).$promise
            .then(function(res) {
                console.log(res);
                $cookieStore.put('username', res.username);
                // $cookieStore.put('token', res.token);
                $cookieStore.put('isLoggin', true);
                that.persistentData.token = res.token;
                that.persistentData.loggedIn = true;
                that.persistentData.username = auth.username;
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                deferred.resolve(res);                   
            }, function(err){
                deferred.reject(err);
            })
                
        return deferred.promise;
    };


    /**
     * Log the user in by token
     * Makes an post call to /auth_token with credentials, on success set the persistentData, and
     * starts a new expire timer
     *
     * @param {String} token
     * @returns {Promise} - User logged in, connect data manager and sync resources
     */
    User.prototype.loginbytoken = function(token) {
        return $resource(Controller.base() + '/auth_token')
            .save(token).$promise
            .then(function(res) {
                var parsedToken = parseUserToken(res);
                this.persistentData.token = parsedToken;
                this.persistentData.loggedIn = true;
                this.persistentData.username = "user";

                // save new persistentData
                this.setToLocalStorage();
                Token.token = this.persistentData.token;

                // reset expire timer to new expire time
                clearTimeout(this.expireTimer);
                var timeout = this.persistentData.token.expires - Date.now();
                this.expireTimer = timer(timeout, this.logout.bind(this));
            }.bind(this))
            .then(DataManager.connect.bind(DataManager))
            .then(Resources.sync.bind(Resources))
            .then(this.syncWithResources.bind(this));
    };


    /**
     * Logout the user, clears all the persisted data
     * Prune the resource graph, and disconnect data manager socket connection
     * clears the expire time
     */
    User.prototype.logout = function() {
        for (var prop in this.persistentData) delete this.persistentData[prop];
        var cookies = $cookies.getAll();
            _.each(cookies, function (v, k) {
                $cookies.remove(k);
        });

        return Q.resolve();
    }


    User.prototype.resetPassword= function(obj){
        return $resource(Controller.base() + 'api/resetpwd').save(obj).$promise;
    }

    var user = new User();

    // // Log user out on unauthorized response
    // $rootScope.$on('unauthorized', function() {
    //     user.logout();
    // });

    return user;
}



/**
 * Set timeout wrapper
 * @param {Number} timeout - how long later to call function
 * @param {Function} fn - function to call at a later time
 * @returns {setTimeout} - reference to clearTimeout if needed
 */
function timer(timeout, fn) {
    return setTimeout(fn, timeout);
}

/**
 * Parse backend response for Token /auth
 * @param {JSON} res - backend response
 * @returns {Object} - parsed user token
 */
function parseUserToken(res){
    var parseTimeFormat = new Date(res.Token.expiresAt).getTime();
    return {
        expires: parseTimeFormat,
        id: res.Token.tokenId,
        isAdmin: res.Token.isAdmin
    };
}

}());
