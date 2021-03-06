
var copyOwnFrom = require('../util/copy-from-own');

/*
    DalekError is a specialization of the Error object so that we
    can properly differentiate what went wrong. It is to be used
    for user error, network error, etc.
 */

module.exports = function(/*dalek*/) {
  'use strict';

  function DalekError(message, code, stack, extra) {
    if (typeof message === 'object') {
      extra = message.extra;
      stack = message.stack;
      code = message.code;
      message = message.message;
    }

    if (typeof code === 'string') {
      code = DalekError[code];
    }

    var superInstance = Error.call(null, message, code);
    copyOwnFrom(this, superInstance);
    this.message = message;
    this.code = code;
    this.extra = extra;
    this._stack = stack;
  }

  DalekError.NETWORK = 1;
  DalekError.TIMEOUT = 2;
  DalekError.DRIVER = 3;
  DalekError.PLUGIN_CALL = 4;
  DalekError.PLUGIN_REGISTRATION = 5;
  DalekError.PLUGIN_EXECUTION = 6;
  DalekError.WEBDRIVER = 7;
  DalekError.USAGE = 8;


  DalekError.prototype = Object.create(Error.prototype);
  DalekError.prototype.constructor = DalekError;

  return DalekError;
};
