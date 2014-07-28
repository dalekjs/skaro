/*
    DalekError is a specialization of the Error object so that we
    can properly differentiate what went wrong. It is to be used
    for user error, network error, etc.
 */

module.exports = function(/*dalek*/) {
  'use strict';

  function DalekError(message, code, stack) {
    var superInstance = Error.apply(null, arguments);
    copyOwnFrom(this, superInstance);
    this.message = message;
    this.code = code;
    this._stack = stack;
  }

  DalekError.NETWORK = 1;
  DalekError.TIMEOUT = 2;
  DalekError.PLUGIN_CALL = 3;

  DalekError.prototype = Object.create(Error.prototype);
  DalekError.prototype.constructor = DalekError;

  // see http://www.2ality.com/2011/12/subtyping-builtins.html
  function copyOwnFrom(target, source) {
    Object.getOwnPropertyNames(source).forEach(function(propName) {
      Object.defineProperty(
        target,
        propName,
        Object.getOwnPropertyDescriptor(source, propName)
      );
    });

    return target;
  }

  return DalekError;
};
