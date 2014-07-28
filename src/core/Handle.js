/*
    The Handle used to communicate intention and status
    between plugins and their authority (usually a Unit)
 */

module.exports = function(dalek) {
  'use strict';

  function Handle(label, type, name) {
    this.label = label;
    this.type = type;
    this.name = name;
    this.deferred = dalek.Q.defer();

    this.reject = this.deferred.reject.bind(this.deferred);
    this.resolve = this.deferred.resolve.bind(this.deferred);
    this.then = this.deferred.promise.then.bind(this.deferred.promise);

    this.stopTimeout = this.stopTimeout.bind(this);
    this.then(this._stopTimeout).catch(this._stopTimeout);
  }

  Handle.ACTION = 1;
  Handle.ASSERTION = 2;

  Handle.prototype.timeout = function(duration) {
    this._timeout = setTimeout(function() {
      this.reject(new dalek.Error('Timeout of ' + duration + 'ms reached', dalek.Error.TIMEOUT));
    }, duration);
  };

  Handle.prototype.stopTimeout = function() {
    clearTimeout(this._timeout);
  };

  Handle.prototype.rejectWithMessage = function(index, message, reason) {
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

  Handle.prototype.rejectSelector = function() {
    this.reject('Selector did not match any elements');
  };

  Handle.prototype.resolveItems = function(items) {
    this.resolve(dalek.format.index(items) + ' elements passed');
  };

  return Handle;
};
