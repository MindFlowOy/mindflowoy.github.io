(function() {
  'use strict';
  /*
  Angular bootsrapper
  */

  angular.element(window.document).ready(function() {
    var body, e, _ref;
    angular.bootstrap(document, ['main']);
    try {
      return body = (_ref = window.document.getElementsByTagName('body')) != null ? _ref[0] : void 0;
    } catch (_error) {
      e = _error;
      if (typeof console !== "undefined" && console !== null ? console.info : void 0) {
        return console.info("Angular bootsrap error " + e);
      }
    }
  });

  if (typeof console !== "undefined" && console !== null ? console.info : void 0) {
    console.info("Angular bootsrapped");
  }

}).call(this);
