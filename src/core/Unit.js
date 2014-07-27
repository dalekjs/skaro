module.exports = function(dalek) {
  // TODO: create Unit wrapper

  function Unit(label, options) {
    this.label = label;
    this.options = options;
  };

  return Unit;
};