;(function() {
'use strict';

/* Controllers */

angular.module('app.controllers')
.controller('HeaderCtrl', [
    '$scope',
    '$modal',
    '$cookieStore',
    '$location',
    '$window',
    '$rootScope',
    '$state',
    'User',
    'AUTH_EVENTS',
    HeaderCtrl
]);


function HeaderCtrl($scope, $modal, $cookieStore, $location, $window, $rootScope, $state, User, AUTH_EVENTS) {

  $scope.User = User;

  $scope.openModal = function(status){
    $scope.userStatus = status;
    var signupModalInstance = $modal.open({
      animation: true,
      scope: $scope,
      templateUrl: 'scripts/directives/modal/headerModal.tpl.html',
      controller: 'HeaderModalCtrl'
    });
  }

  $rootScope.$on(AUTH_EVENTS.notAuthenticated, function(){
    $scope.openModal('login');
  })

  $scope.HideDropdown = function() {
    $scope.showDropdownStatus = false;
  }

  $scope.ShowDropdown = function() {
    $scope.showDropdownStatus = true;
  }

  $scope.updateHeader = function() {
    if($cookieStore.get('isLoggin') && $cookieStore.get('username')) {
      if($cookieStore.get('isLoggin')) {
        $scope.isLoggin = true;
      } else {
        $scope.isLoggin = false;
      }

      $scope.loginName = $cookieStore.get('nickname') || $cookieStore.get('username');
      $scope.userImage = $cookieStore.get('userimage');
      // if($cookies.get('is_admin') === 'true') {
      //   $scope.isAdmin = true;
      // } else {
      //   $scope.isAdmin = false;
      // }
    } else {
      $scope.isLoggin = false;
    }
  };

  $scope.logout = function(){
    User.logout().then(function(){
          $scope.updateHeader();
          $state.go('main');
          $window.location.reload();
        }
      )
  }


  $scope.updateHeader();

}

}());


