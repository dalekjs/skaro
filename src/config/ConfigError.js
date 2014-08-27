'use strict';

var Q = require('q');

/*
    ConfigError is a specialization of the Error object so that we
    can properly differentiate what went wrong.
 */

function ConfigError(type, code, path, original) {
  var superInstance = Error.apply(null, arguments);
  copyOwnFrom(this, superInstance);
  this.message = type + ' ' + (ConfigError.MESSAGES[code] || 'error occured');
  this.code = code;
  this.type = type;
  this.path = path;
  this.original = original;
  this.fileStack = [];
}

ConfigError.NOT_FOUND = 1;
ConfigError.NOT_READABLE = 2;
ConfigError.NOT_PARSEABLE = 3;
ConfigError.VALUE_TEMPLATE = 10;
ConfigError.VALUE_TYPE = 11;

ConfigError.MESSAGES = {
  1: 'file not found',
  2: 'file not readable',
  3: 'file not valid JSON',
  10: 'file contains malformed template',
  11: 'file contains unexpected value type'
};

ConfigError.decorateCatch = function decorateCatch(type, code, path) {
  return function decorateConfigError(original) {
    if (original instanceof ConfigError) {
      return Q.reject(original);
    }

    return Q.reject(new ConfigError(type, code, path, original));
  }
};

ConfigError.catchFileStack = function(path) {
  return function decorateFileStack(error) {
    if (error.path !== path && error.fileStack[0] !== path) {
      error.fileStack.unshift(path);
    }

    return Q.reject(error);
  }
}

ConfigError.prototype = Object.create(Error.prototype);
ConfigError.prototype.constructor = ConfigError;

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

module.exports = ConfigError;
