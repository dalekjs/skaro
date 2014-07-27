
var Q = require('q');

// TODO: create driver interface
function Driver(options) {
  this.options = options;
}

Driver.protoype.element = {
  attribute: function() {
    // TODO: define interface for access from plugins
    // resolve(['value of element1', 'value of element2', …])
    // reject('Selector did not match any elements')
    var deferred = Q.defer();
    deferred.resolve(['Google', 'Microsoft']);
    return deferred.promise;
  }
};

module.exports = Driver;