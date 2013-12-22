(function() {
  'use strict';
  /*
  Common controllers
  */

  angular.module('common.ctrl', []).controller('BaseCtrl', [
    '$rootScope', '$scope', '$log', function($rootScope, $scope, $log) {
      $log.info("Base Ctrl loaded");
      return $scope.init = function() {
        $log.log("Base Ctrl init");
        return false;
      };
    }
  ]);

}).call(this);
