module.exports = function(dalek) {
  // see http://www.2ality.com/2011/12/subtyping-builtins.html

  function DalekError() {
    var superInstance = Error.apply(null, arguments);
    copyOwnFrom(this, superInstance);
  }

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
