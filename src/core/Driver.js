module.exports = function(dalek) {
  'use strict';

  // TODO: create driver interface
  function Driver(options) {
    this.options = options;
  }

  Driver.prototype.element = {
    attribute: function(/*options*/) {
      /*
          options: {
            selector: Selector
            match: String
            attribute: String
          }

          success case (returns array):
            resolve(['value of element1', 'value of element2', …])

          error cases:
            reject('Selector did not match any elements')
            reject(new DalekError('browser unable to execute selector'))
            reject(new DalekError('lost connection to browser', DalekError.NETWORK))
            reject(new DalekError('request timed out', DalekError.TIMEOUT))
            reject(new DalekError('Chrome driver does not support fetching attributes', DalekError.DRIVER))
       */
      var deferred = dalek.Q.defer();
      deferred.resolve(['Google', 'Microsoft']);
      return deferred.promise;
    },

    click: function(/*options*/) {
      /*
          options: {
            selector: Selector
          }

          success case (returns array):
            resolve([true, true, true, …])

          error cases:
            resolve([true, 'element not found', 'element not visible', …])
            reject('Selector did not match any elements')
            reject(new DalekError('browser unable to execute selector'))
            reject(new DalekError('lost connection to browser', DalekError.NETWORK))
            reject(new DalekError('request timed out', DalekError.TIMEOUT))
            reject(new DalekError('Firefox driver does not support the click method', DalekError.DRIVER))
       */
      var deferred = dalek.Q.defer();
      // deferred.resolve([true, 'element not found']);
      deferred.resolve([true, true]);
      return deferred.promise;
    }
  };

  return Driver;
};