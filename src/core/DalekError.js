module.exports = function(dalek) {
  // see http://www.2ality.com/2011/12/subtyping-builtins.html

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

  function copyOwnFrom(target, source) {
    Object.getOwnPropertyNames(source).forEach(function(propName) {
      Object.defineProperty(
        target,
        propName,
        Object.getOwnPropertyDescriptor(source, propName)
      );
    });

    return target;
  };

  return DalekError;
};
