// scrollEvents version 0.6.0
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
// <http://www.gnu.org/licenses/>.

(function(win, doc) {
  'use strict';  
  if (win.scrollEvents) {
    // better to throw a new Error than just throw alone
    throw new Error('You already have a global variable named scrollEvents, please rename scrollEvents.');
  }

  // select all elements matching selector
  function qsa (selector) {
      return doc.querySelectorAll(selector);
  }

  // alias forEach since we use it so much
  var each = qsa.call.bind([].forEach);

  //add another scroll event listener
  function addScrollListener (selectors, fn, initialValue, changedValue, breakPoint) {
    win.addEventListener('scroll', function () {
      var value = win.pageYOffset > breakPoint ? changedValue : initialValue;
      // apply fn to each selected element with the current value
      each(qsa(selectors), function apply(el) {
        fn(el, value);
      });
    });
  }

  win.scrollEvents = {
    breakPoint: 10,

    changeClass: function (selectors, initialValue, changedValue, breakPoint) {
      if (arguments.length < 3) {
        throw new Error('You have not supplied all parameters to scrollEvents.changeClass, this may cause weird or unexpected behavior. The parameters are: selectors, initialValue, changedValue, breakPoint. Note that breakPoint is optional and the default is 10.');
      }
      addScrollListener(selectors, function changeClass(el, value) {
        var classes = el.classList,
          initial = initialValue === value;
        classes.toggle(initialValue, initial);
        classes.toggle(changedValue, !initial);
      }, initialValue, changedValue, breakPoint || this.breakPoint);
    },

    changeStyle: function (selectors, property, initialValue, changedValue, breakPoint) {
      if (arguments.length < 4) {
        throw new Error('You have not supplied all parameters to scrollEvents.changeStyle, this may cause weird or unexpected behavior. The parameters are: selectors, property, initialValue, changedValue, breakPoint. Note that breakPoint is optional and the default is 10.');
      }
      addScrollListener(selectors, function changeStyleProperty(el, value) {
        el.style[property] = value;
      }, initialValue, changedValue, breakPoint || this.breakPoint);
    },

    changeText: function (selectors, initialValue, changedValue, breakPoint) {
      if (arguments.length < 3) {
        throw new Error('You have not supplied all parameters to scrollEvents.changeText, this may cause weird or unexpected behavior. The parameters are: selectors, initialValue, changedValue, breakPoint. Note that breakPoint is optional and the default is 10.');
      }
      addScrollListener(selectors, function changeTextContent(el, value) {
        el.textContent = value;
      }, initialValue, changedValue, breakPoint || this.breakPoint);
    }
  }; 
})(window, document);
