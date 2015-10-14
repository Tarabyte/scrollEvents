// scrollEvents version 1.0.0
//
// Ryan P.C. McQuen | Everett, WA | ryan.q@linux.com
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version, with the following exception:
// the text of the GPL license may be omitted.
//
// This program is distributed in the hope that it will be useful, but
// without any warranty; without even the implied warranty of
// merchantability or fitness for a particular purpose. Compiling,
// interpreting, executing or merely reading the text of the program
// may result in lapses of consciousness and/or very being, up to and
// including the end of all existence and the Universe as we know it.
// See the GNU General Public License for more details.
//
// You may have received a copy of the GNU General Public License along
// with this program (most likely, a file named COPYING).  If not, see
// <https://www.gnu.org/licenses/>.
(function (win, doc) {
  'use strict';
  if (win.scrollEvents) {
    // better to throw a new Error than just a string
    throw new Error('You already have a global variable named scrollEvents.');
  }
  // slightly modified/simplified version of underscore.js's throttle (v1.8.3)
  function throttle(func, wait) {
    var timeout = null,
      previous = 0,
      later = function () {
        previous = Date.now();
        timeout = null;
        func();
      };
    return function () {
      var now = Date.now();
      if (!previous) previous = now;
      var remaining = wait - (now - previous);
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        func();
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
    };
  }
  // select all elements matching selector
  function qsa(selector) {
    return doc.querySelectorAll(selector);
  }
  // alias forEach since we use it so much
  var each = qsa.call.bind([].forEach),
    // array to hold all event listeners
    listeners = [],
    // run all listeners
    runner = throttle(function () {
      each(listeners, function (listener) {
        listener();
      });
    }, 50);

  // add scroll listener
  function addEventListener(fn) {
    if (!listeners.length) {
      // add single dom event listener that will run all registered listeners
      win.addEventListener('scroll', runner);
    }

    listeners.push(fn);

    return function removeEventListener() {
      // find current fn index
      var index = listeners.indexOf(fn);
      // if it is still there,
      // remove
      if (index > -1) {

        listeners.splice(index, 1);
      }

      // if no more listeners left,
      // unbind
      if (!listeners.length) {
        win.removeEventListener('scroll', runner);
      }
    };
  }

  // all scrollEvents public methods
  // both static and prototypes
  var methods = {
      /**
       * Changes element class.
       */
      changeClass: function (initial, changed) {
        if (arguments.length < 2) {
          throw new Error('You have not supplied all parameters to scrollEvents.changeClass.');
        }

        return function (el, below) {
          var classes = el.classList;
          classes.toggle(initial, !below);
          classes.toggle(changed, below);
        };
      },

      /**
       * Changes element html content.
       */
      changeHTML: function (initial, changed) {
        if (arguments.length < 2) {
          throw new Error('You have not supplied all parameters to scrollEvents.changeHTML.');
        }

        return function (el, below) {
          el.innerHTML = below ? changed : initial;
        };
      },

      /**
       * Changes element.style.property value.
       */
      changeStyle: function (property, initial, changed) {
        if (arguments.length < 3) {
          throw new Error('You have not supplied all parameters to scrollEvents.changeStyle.');
        }

        return function (el, below) {
          el.style[property] = below ? changed : initial;
        };
      },

      /**
       * Changes element.textContent.
       */
      changeText: function (initial, changed) {
        if (arguments.length < 2) {
          throw new Error('You have not supplied all parameters to scrollEvents.changeText.');
        }

        return function (el, below) {
          el.textContent = below ? changed : initial;
        };
      }

    },
    // all method names
    methodNames = Object.keys(methods);

  function scrollSpy(selector) {
    var spy = {},
      // all registered callbacks changers.
      callbacks = [];
    // spy requires selector
    if (!selector) {
      throw new Error('Selector is required to apply scroll events to.');
    }

    // enhance spy object with public methods.
    methodNames.forEach(function (name) {
      // original method
      var method = methods[name];

      // make function that checks if we cross the breakPoint
      function makeBreakPointChecker(args) {
        var breakPoint = args[method.length] || scrollSpy.breakPoint;

        var selectorBreakPointIsUsed = false;
        // breakPoint is a selector
        if (typeof breakPoint === 'string') {
          breakPoint = doc.querySelector(breakPoint).offsetTop;
          selectorBreakPointIsUsed = true;
        }

        return function () {
          // use window.pageYOffset plus the viewport height as a default (new in v1.0.0)
          // this way when selectors are used, the change happens when those
          // selectors enter the viewport, not when they hit the top of the page
          // thanks to @Tarabyte and @RamonGebben for feedback
          var scrollPoint;
          if (selectorBreakPointIsUsed) {
            scrollPoint = (scrollEvents.useViewportHeight) ? (win.pageYOffset + window.innerHeight) : win.pageYOffset;
          } else {
            scrollPoint = win.pageYOffset;
          }
          return scrollPoint > breakPoint;
        };
      }

      spy[name] = function () {
        // previous value
        var previous,
          args = arguments,
          // make isBelow checker
          isBelow = makeBreakPointChecker(args),
          // make el changer
          callback = method.apply(spy, args);

        // add to callback list
        callbacks.push(function (elements) {
          // get current value
          var current = isBelow();

          // check if it was actually changed
          if (current !== previous) {
            // save for the next call
            previous = current;

            // check if another callback has already made dom query
            if (!elements) {
              // query the DOM
              elements = qsa(selector);
            }
            // apply changer to each element
            each(elements, function (el) {
              callback(el, current);
            });
          }

          // return elements for the next callback to avoid multiple queries
          return elements;
        });

        return spy;
      };
    });

    // run all callbacks passing elements around
    function listener() {
      var elements;

      each(callbacks, function (cb) {
        elements = cb(elements);
      });
    }

    // does nothing but returns current spy
    function noop() {
      return spy;
    }

    // create on method that binds scroll listener for current spy
    spy.on = function on() {
      // add DOM listener
      var unbinder = addEventListener(listener);

      // avoid multiple inits
      spy.on = noop;

      // make a turn off method
      spy.off = function off() {
        // unbind
        unbinder();

        // noop to avoid multiple unbinds.
        spy.off = noop;

        // restore on method
        spy.on = on;

        return spy;
      };

      return spy;
    };

    // init
    spy.on();

    return spy;
  }

  // default breakPoint
  scrollSpy.breakPoint = 10;

  // add the option to use the viewport height,
  // so that events can trigger when objects first
  // enter the viewport, rather than when they
  // hit the top of the page, ONLY activates
  // when breakPoint is a selector
  //
  // default is true until i am convinced that false
  // is more intuitive
  scrollSpy.useViewportHeight = true;

  // enhance scrollSpy with static methods
  methodNames.forEach(function (name) {
    scrollSpy[name] = function (selector /*, rest...*/ ) {
      var rest = [].slice.call(arguments, 1),
        // create a spy
        spy = scrollSpy(selector);

      // and invoke corresponding method on it
      return spy[name].apply(spy, rest);
    };
  });

  // export 
  win.scrollEvents = scrollSpy;
})(window, document);