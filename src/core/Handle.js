/*
    The Handle used to communicate intention and status
    between plugins and their authority (usually a Unit)
 */

module.exports = function(dalek) {
  'use strict';

  function Handle(label, type, name) {
    this.label = label;
    this.status = null;
    this.message = null;

    this.type = type;
    this.name = name;
    this.deferred = dalek.Q.defer();

    this.operationsPlanned = 0;
    this.operationsPerformed = 0;

    this.reject = this.deferred.reject.bind(this.deferred);
    this.resolve = this.deferred.resolve.bind(this.deferred);
    this.then = this.deferred.promise.then.bind(this.deferred.promise);
    this.catch = this.deferred.promise.catch.bind(this.deferred.promise);

    this.deferred.promise.then(
      this._resolved.bind(this),
      this._rejected.bind(this)
    );

    this.stopTimeout = this.stopTimeout.bind(this);
    this.then(this._stopTimeout).catch(this._stopTimeout);
  }

  Handle.DALEK = 1;
  Handle.SUITE = 2;
  Handle.UNIT = 3;
  Handle.ACTION = 4;
  Handle.ASSERTION = 5;
  Handle.UNTIL = 6;

  Handle.prototype.timeout = function(duration) {
    this._timeout = setTimeout(function() {
      this.reject(new dalek.Error('Timeout of ' + duration + 'ms reached', dalek.Error.TIMEOUT));
    }, duration);
  };

  Handle.prototype.stopTimeout = function() {
    clearTimeout(this._timeout);
  };


  Handle.prototype.setOperations = function(ops) {
    this.operationsPlanned = ops;
  };

  Handle.prototype.setOperationsPerformed = function(ops) {
    this.operationsPerformed = ops;
  };

  Handle.prototype.performOperation = function() {
    this.operationsPerformed++;
  };


  Handle.prototype._resolved = function(message) {
    this.message = message;
    this.status = true;
  };

  Handle.prototype._rejected = function(message) {
    this.message = message;
    this.status = false;
  };


  Handle.prototype.rejectWithMessage = function(index, message, reason) {
    this.message = '';

    if (typeof index === 'number') {
      this.message += dalek.format.index(index) + ' ';
      this.operationsPerformed = index;
    }

    if (message) {
      this.message += message;
    } else if (typeof reason === 'string') {
      this.message += reason;
    } else {
      this.message += 'unspecified failure';
    }

    this.reject(this.message);
  };

  Handle.prototype.rejectSelector = function() {
    this.message = 'Selector did not match any elements';
    this.reject(this.message);
  };

  Handle.prototype.resolveItems = function(items) {
    this.message = dalek.format.index(items) + ' elements passed';
    this.operationsPerformed = items;
    this.resolve(this.message);
  };

  return Handle;
};
