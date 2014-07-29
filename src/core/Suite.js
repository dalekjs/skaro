module.exports = function(/* dalek */) {
  'use strict';

  // TODO: create Unit wrapper

  function Suite(label, options) {
    this.label = label;
    this.options = options;
  }

  return Suite;
};