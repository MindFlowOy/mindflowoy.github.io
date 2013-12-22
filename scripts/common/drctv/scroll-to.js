(function() {
  'use strict';
  /*
  * AngularJS directives to navigation and smooth scrollin based on menu selection and scroll position
  * Usage:
  * <body data-mf-spy-scroll-to='true'>
  *    <nav>
  *        <a mf-scroll-to='id1' [offset='value']>...</a>
  *        <a mf-scroll-to='id2' [offset='value']>...</a>
  *     </nav>
  * </body>
  * Inspired by: http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript
  */

  var mdl;

  mdl = angular.module('common.drctv', []);

  /*
  * Directives' helper service to store scorll anchors for updating nav menu based on scroll position.
  * Conatins also many helper classes for easy scrolling - not sure what would be best palce for them if not here
  * Inspired by: https://github.com/patrickmarabeas/ng-ScrollSpy.js
  */


  mdl.service('scrollToService', [
    '$window', '$log', function($window, $log) {
      return {
        navItems: [],
        EASY_ITERATIONS: 60,
        DIRECTIONS: {
          NEXT: 'next',
          PREV: 'prev'
        },
        /*
        * Add navigation items saved ones
        * @param {Object.<element, string>} nav - Object to be saved for later use by directives, contains nav element and target anchor id values
        */

        addNavItem: function(nav) {
          var alreadyThere, item, _i, _len, _ref;
          if ((nav != null ? nav.anchor : void 0) && (nav != null ? nav.element : void 0)) {
            alreadyThere = false;
            _ref = this.navItems;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              item = _ref[_i];
              if (item.anchor === nav.anchor) {
                alreadyThere = true;
              }
            }
            if (!alreadyThere) {
              nav.position = this.elmYPosition(nav.anchor) - 200;
              return this.navItems.push(nav);
            }
          }
        },
        /*
        * Helper to get the current vertical position of the given DOM element
        * @param {string} eID - The DOM element id
        * @returns The vertical position of element with id eID
        */

        elmYPosition: function(eID) {
          var elm, node, y;
          elm = document.getElementById(eID);
          if (elm) {
            y = elm.offsetTop;
            node = elm;
            while (node.offsetParent && node.offsetParent !== document.body) {
              node = node.offsetParent;
              y += node.offsetTop;
            }
            return y;
          }
          return 0;
        },
        /*
        * Helper to get linear easing values when direction, target and current position is known
        * @param {string}  direction
        * @param {number}  target position
        * @param {number}  current position
        * @returns {Array.<number>}  - Easign values
        */

        calculateEasyVals: function(direction, target, position) {
          var easyVal, easyVals, iteration, iterationStep, lastVal, spaceToIterate;
          easyVals = [];
          iteration = 0;
          if (direction === this.DIRECTIONS.NEXT) {
            lastVal = position;
            while (lastVal < target) {
              iteration++;
              spaceToIterate = target - position;
              iterationStep = Math.round(spaceToIterate / this.EASY_ITERATIONS);
              easyVal = position + iteration * iterationStep;
              if (easyVal > target) {
                easyVal = target;
              }
              lastVal = easyVal;
              if (easyVal < 0) {
                easyVal = 0;
              }
              easyVals.push(easyVal);
            }
          } else if (direction === this.DIRECTIONS.PREV) {
            lastVal = position;
            while (lastVal > target) {
              iteration++;
              spaceToIterate = position - target;
              iterationStep = Math.round(spaceToIterate / this.EASY_ITERATIONS);
              easyVal = position - iteration * iterationStep;
              lastVal = easyVal;
              if (easyVal < target) {
                easyVal = target;
              }
              if (easyVal < 0) {
                easyVal = 0;
              }
              easyVals.push(easyVal);
            }
          }
          return easyVals;
        },
        /*
        * Scroll to the element with given easing positions by using Animation Frames
        * @param {element} el - The element where to scroll to
        * @param {Array.<number>}  easing - Easign values
        * @param {number}  iteration - Current animation iteration
        */

        easyScrollTo: function(el, easing, iteration) {
          var repeatScrollTo;
          if (iteration < easing.length) {
            $window.scrollTo(0, easing[iteration]);
            iteration++;
            repeatScrollTo = angular.bind(this, this.easyScrollTo, el, easing, iteration);
            return requestAnimationFrame(repeatScrollTo);
          } else {

          }
        },
        /*
        * Scroll to element with a specific ID and offset
        * @param {element} el - The element where to scroll to
        * @param {number} offSet - Scrolling offset (meaning how much earlier of the element postion scrolling should be stopped)
        */

        scrollToElWithOffset: function(el, offSet) {
          var direction, easingVals, startY, stopY;
          startY = this.currentYPosition();
          stopY = this.elmYPosition(el) - offSet;
          direction = this.DIRECTIONS.NEXT;
          if (stopY < startY) {
            direction = this.DIRECTIONS.PREV;
          }
          easingVals = this.calculateEasyVals(direction, stopY, startY);
          this.easyScrollTo(el, easingVals, 0);
        },
        /*
        * Helper to retrieve the current vertical position
        * @returns {number} Current vertical position
        */

        currentYPosition: function() {
          if ($window.pageYOffset) {
            return $window.pageYOffset;
          }
          if ($window.document.documentElement && $window.document.documentElement.scrollTop) {
            return $window.document.documentElement.scrollTop;
          }
          if ($window.document.body.scrollTop) {
            return $window.document.body.scrollTop;
          }
          return 0;
        }
      };
    }
  ]);

  /*
  * Scroll position directive to show correct navigation item when users are scrolling the page
  */


  mdl.directive('mfSpyScrollTo', [
    '$log', 'scrollToService', '$interval', function($log, scrollToService, $interval) {
      return {
        restrict: "A",
        controller: [
          "$scope", function($scope) {
            return this.scrollToService = scrollToService;
          }
        ],
        link: function(scope, element, attrs) {
          var broadcast, checkPosition, deboncedCheckPosition, oldItem;
          $log.info('mfSpyScrollTo ', element);
          oldItem = void 0;
          broadcast = function(navItem) {
            var msg;
            if (navItem && oldItem !== navItem) {
              oldItem = navItem;
              msg = {
                navItem: navItem
              };
              return scope.$broadcast("spyScrollTo", msg);
            }
          };
          checkPosition = function() {
            var currentPosition, item, _i, _ref, _results;
            currentPosition = scrollToService.currentYPosition();
            if (document.body.scrollTop > 0 && document.body.scrollTop === (document.body.offsetHeight - document.body.clientHeight) || document.body.scrollTop === (document.body.scrollHeight - document.body.clientHeight)) {
              return broadcast(scrollToService.navItems.slice(-1)[0]);
            } else {
              _ref = scrollToService.navItems;
              _results = [];
              for (_i = _ref.length - 1; _i >= 0; _i += -1) {
                item = _ref[_i];
                if (item.position < currentPosition) {
                  broadcast(item);
                  break;
                } else {
                  _results.push(void 0);
                }
              }
              return _results;
            }
          };
          deboncedCheckPosition = _.debounce(checkPosition, 50);
          return angular.element(window).bind("scroll", function() {
            return deboncedCheckPosition();
          });
        }
      };
    }
  ]);

  /*
  * Scroll to anchor navigation directive to handle scrolling to the navigation target on navigation element clicks
  * Uses controller of mfScrollTo directive above to save navigation items
  */


  mdl.directive('mfScrollTo', [
    '$document', '$window', '$location', '$log', '$timeout', function($document, $window, $location, $log, $timeout) {
      return {
        restrict: 'A',
        require: ["?^mfSpyScrollTo"],
        scope: {
          mfScrollTo: '@'
        },
        link: function(scope, element, attr, spyScrollToCtrls) {
          var offset, spyScrollCtrl;
          if (!scope.mfScrollTo) {
            $log.error('Set element where to be scrolled');
            return;
          }
          offset = attr.offset || 100;
          spyScrollCtrl = spyScrollToCtrls[0];
          spyScrollCtrl.addNavItem({
            element: element,
            anchor: scope.mfScrollTo
          });
          element.bind('click', function(event) {
            var alreadyScrolling;
            alreadyScrolling = true;
            if (event.preventDefault) {
              event.preventDefault();
            }
            if (event.stopPropagation) {
              event.stopPropagation();
            }
            if (event.stopImmediatePropagation) {
              event.stopImmediatePropagation();
            }
            offset = attr.offset || 100;
            spyScrollCtrl.scrollToElWithOffset(scope.mfScrollTo, offset);
            return false;
          });
          return scope.$on('spyScrollTo', function(event, args) {
            var navItem, toggleClass;
            navItem = args.navItem;
            toggleClass = toggleClass || 'selected';
            if (navItem.element === element) {
              return element.addClass('selected');
            } else {
              return element.removeClass('selected');
            }
          });
        }
      };
    }
  ]);

}).call(this);
