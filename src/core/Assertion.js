module.exports = function(dalek) {

  function Assertion(label) {
    this.label = label;
    this.deferred = dalek.Q.defer();

    this.reject = this.deferred.reject.bind(this.deferred);
    this.resolve = this.deferred.resolve.bind(this.deferred);
    this.then = this.deferred.promise.then.bind(this.deferred.promise);
  }

  Assertion.prototype.rejectWithMessage = function(index, message, reason) {
    var _message = '';

    if (typeof index === 'number') {
      _message += dalek.format.index(index) + ' ';
    }

    if (message) {
      _message += message;
    } else if (typeof reason === 'string') {
      _message += reason;
    } else {
      _message += 'unspecified failure';
    }

    this.reject(_message);
  };

  Assertion.prototype.rejectSelector = function() {
    this.reject('Selector did not match any elements');
  };

  Assertion.prototype.resolveItems = function(items) {
    this.resolve(dalek.format.index(items) + ' elements passed');
  };

  return Assertion;
};
