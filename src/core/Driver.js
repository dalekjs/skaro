module.exports = function(dalek) {
  var Q = dalek.Q;

  // TODO: create driver interface
  function Driver(options) {
    this.options = options;
  }

  Driver.prototype.element = {
    attribute: function(options) {
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
       */
      var deferred = Q.defer();
      deferred.resolve(['Google', 'Microsoft']);
      return deferred.promise;
    }
  };

  return Driver;
};