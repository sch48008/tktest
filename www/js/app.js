// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'starter.controllers', 'RESTConnection', 'TKServicesModule', 'chart.js', 'SSFAlerts'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.run(["$rootScope", "$ionicLoading", function($rootScope, $ionicLoading) {
  $rootScope.$on('loading:show', function() {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner>'
    });
  });
  $rootScope.$on('loading:hide', function() {
    $ionicLoading.hide();
  });
}])

.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
      .state('landing', {
        url: '/',
        templateUrl: 'templates/landing.html'
      })
      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })
      .state('lobby', {
        url: '/lobby',
        templateUrl: 'templates/lobby.html',
        controller: 'LobbyCtrl'
      })
      .state('register', {
        url: '/register',
        templateUrl: 'templates/register.html',
        controller: 'RegisterCtrl'
      })
      .state('test', {
        abstract: true,
        url: '/test',
        template: '<ion-nav-view></ion-nav-view>'
      })
      .state('test.detail', {
        url: '/question:testID',
        templateUrl: 'templates/question.html',
        controller: 'TestCtrl',
        resolve: {
          testInfo: function($stateParams, TKQuestionsService) {
            return TKQuestionsService.getQuestion($stateParams.testID);
          }
        }
      })
      .state('results', {
        url: '/results',
        templateUrl: 'templates/results.html',
        controller: 'ResultsCtrl'
      })
      .state('history', {
        url: '/history',
        templateUrl: 'templates/history.html',
        controller: 'HistoryCtrl'
      });
  })
  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push(function($rootScope) {
      return {
        request: function(config) {
          $rootScope.$broadcast('loading:show');
          return config;
        },
        response: function(response) {
          $rootScope.$broadcast('loading:hide');
          return response;
        },
        requestError: function(reason) {
          $rootScope.$broadcast('loading:hide');
          return reason;
        },
        responseError: function(response) {
          $rootScope.$broadcast('loading:hide');
          return response;
        }
      };
    });
  }]);