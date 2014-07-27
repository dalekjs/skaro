module.exports = function(dalek) {
  var Q = dalek.Q;

  // TODO: create driver interface
  function Driver(options) {
    this.options = options;
  }

  Driver.prototype.element = {
    attribute: function() {
      // TODO: define interface for access from plugins
      // resolve(['value of element1', 'value of element2', …])
      // reject('Selector did not match any elements')
      var deferred = Q.defer();
      deferred.resolve(['Google', 'Microsoft']);
      return deferred.promise;
    }
  };

  return Driver;
};