var Q = require('q');
// TODO: create Assertion (with promise interface)

function Assertion(label) {
  this.label = label;
  this.deferred = Q.defer();

  this.reject = this.deferred.reject.bind(this.deferred);
  this.resolve = this.deferred.resolve.bind(this.resolve);
  this.then = this.deferred.then.bind(this.resolve);
}

module.exports = Assertion;