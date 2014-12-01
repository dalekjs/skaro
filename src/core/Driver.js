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

    // TODO: Write `match` filter function wrapper
    if (typeof options.match === 'function') {
      throw new Error('Not implemented yet');
      deferred.reject();
      return deferred.promise;
    }

    // Load all elements & return them based on the `match` option
    this.wd.elements(options.selector.strategy, options.selector.text).then(
      function (elements) {

        if (!elements.length) {
          deferred.reject();
        }

        var _elements = dalek._.pluck(elements, 'value');

        if (dalek._.isNumber(options.match)) {
          if (_elements[options.match]) {
            deferred.resolve([_elements[options.match]]);
          } else {
            deferred.reject();
          }
        }

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
