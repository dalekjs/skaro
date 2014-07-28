module.exports = function(/* dalek */) {
  'use strict';

  // TODO: create Unit wrapper

  function Unit(label, options) {
    this.label = label;
    this.options = options;
  }

  return Unit;
};