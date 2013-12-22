(function() {
  'use strict';
  /*
  Main module config & run
  */

  var main;

  main = angular.module('main', ['ngRoute', 'common.ctrl', 'common.drctv']);

  main.config([
    '$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
      $routeProvider.when('/', {
        template: function(routeParams, curentPath) {
          debugger;
          return '/';
        }
      }).otherwise({
        redirectTo: '/'
      });
      return $locationProvider.html5Mode(true).hashPrefix('!');
    }
  ]);

  main.run([
    '$window', '$document', '$rootScope', '$log', '$q', '$location', function($window, $document, $rootScope, $log, $q, $location) {
      $rootScope.$on('$routeChangeStart', function(newRoute, oldRoute) {
        return $log.info('$routeChangeStart');
      });
      $rootScope.$on('$routeUpdate', function(newRoute, oldRoute) {
        return $log.info('$routeUpdate');
      });
      $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
        $log.info('$routeChangeSuccess!!');
        $location.hash($routeParams.scrollTo);
        return $anchorScroll();
      });
      /*
      * Wrapper for angular.isArray, isObject, etc checks for use in the view by isArray(array),
      * isObject(object) etc (and from code: $scope.isArray())
      *
      * @method isArray, isObject...
      * @param type {string} the name of the check (casing sensitive)
      * @param value {string} value to check
      * @api public
      */

      $rootScope.is = function(type, value) {
        return angular["is" + type](value);
      };
      /*
      * Log debugging tool
      *
      * Allows you to execute log functions from the view by log() (and from code: $scope.log())
      * @method log
      * @param value {mixed} value to be logged
      * @api public
      */

      $rootScope.log = function(variable) {
        if (typeof console !== "undefined" && console !== null ? console.log : void 0) {
          return console.log(variable);
        }
      };
      /*
      * alert debugging tool
      *
      * Allows you to execute alert functions from the view by alert() ( and from code: $scope.alert())
      * @method alert
      * @param {string} text - text to be alerted
      * @api public
      */

      return $rootScope.alert = function(text, needsTranslation) {
        return alert(text);
      };
    }
  ]);

}).call(this);
