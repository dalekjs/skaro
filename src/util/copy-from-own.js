'use strict';

// see http://www.2ality.com/2011/12/subtyping-builtins.html
module.exports = function copyOwnFrom(target, source) {
  Object.getOwnPropertyNames(source).forEach(function(propName) {
    Object.defineProperty(
      target,
      propName,
      Object.getOwnPropertyDescriptor(source, propName)
    );
  });

  return target;
};
