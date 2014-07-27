module.exports = function(dalek) {
  // TODO: create Assertion (with promise interface)
  var format = dalek.format;
  var Q = dalek.Q;

  function Assertion(label) {
    this.label = label;
    this.deferred = Q.defer();

    this.reject = this.deferred.reject.bind(this.deferred);
    this.resolve = this.deferred.resolve.bind(this.deferred);
    this.then = this.deferred.promise.then.bind(this.deferred.promise);
  }

  Assertion.rejectWithMessage = function(index, messages) {
    var message = '';

    if (typeof index === 'number') {
      message += format.index(index) + ' ';
    }

    messages.some(function(item) {
      if (item && typeof item === 'string') {
        message += item;
        return true;
      }
    });

    this.reject(message);
  };

  Assertion.rejectSelector = function() {
    this.reject('Selector did not match any elements');
  };

  Assertion.resolveItems = function(items) {
    this.resolve(format.index(items) + ' elements passed');
  };

  return Assertion;
};
