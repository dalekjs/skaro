module.exports = function(dalek) {
  'use strict';

  var WD = require('wd');

  function Driver (options) {
    this.options = options;
  };

  /**
   * Initialize WD.js && get SessionId
   */

  Driver.prototype.initializeWebdriverConnection = function (options) {
    this.wd = WD.promiseChainRemote('http://' + options.host + ':' + options.port + '/');

    // initializa (aka. get the session id)
    return this.wd.init({browserName: options.id});
  };

  /**
   * Get element references
   */

  Driver.prototype.elements = function (options) {
    var deferred = dalek.Q.defer();

    // `match` filter function wrapper
    if (typeof options.match === 'function') {

      // only CSS (not XPath) is a functional strategy for filtering
      if (options.selector.strategy !== 'css') {
        deferred.reject();
        return deferred.promise;
      }

      // execute the filter function
      this.wd.elements(options.selector.strategy, options.selector.text).then(
        function (elements) {
          var i = 0;
          var filteredElements = [];
          // convert the elements into a structure we can send to the client context
          var _elements = dalek._.map(dalek._.pluck(elements, 'value'), function (element) { return {ELEMENT: element} });

          // iterate over all elements and execute the filter function
          _elements.forEach(function (element, idx) {
            this.wd.execute(options.match, [element, idx, _elements]).then(function (valid) {
              // increment the element counter
              ++i;

              // only include the element if the `filter` function told us it´s valid
              if (!!valid) {
                filteredElements.push(element);
              }

              // resolve the promise when all elements are processed
              if (i === _elements.length) {
                deferred.resolve(dalek._.pluck(filteredElements, 'ELEMENT'));
              }
            });
          }.bind(this));
        }.bind(this)
      );
      return deferred.promise;
    }

    // Load all elements & return them based on the `match` option
    this.wd.elements(options.selector.strategy, options.selector.text).then(
      function (elements) {

        // fail if no elements could be found
        if (!elements.length) {
          deferred.reject();
        }

        // get the webdriver element references
        var _elements = dalek._.pluck(elements, 'value');

        // check if an `index` is given, try to pull that element
        if (dalek._.isNumber(options.match)) {
          if (_elements[options.match]) {
            deferred.resolve([_elements[options.match]]);
          } else {
            deferred.reject();
          }
        }

        // filter first, last, all
        switch (options.match) {
          case 'first':
            deferred.resolve(_elements.slice(0, 1));
            return;
          case 'last':
            deferred.resolve(_elements.slice(-1));
            break;
          case 'all':
            deferred.resolve(_elements);
            break;
          default:
            deferred.reject();
            break;
        }
    });

    return deferred.promise;
  };

  return Driver;
};
