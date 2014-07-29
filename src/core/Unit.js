module.exports = function(dalek) {
  'use strict';

  var _ = dalek._;
  var Q = dalek.Q;

  function Unit(label, options, callback, called) {
    this.label = label;
    this._options = options;
    this._initialize = callback;
    this.called = called || dalek.getStack(Unit);

    if (typeof callback !== 'function') {
      throw new dalek.Error(
        'Unit ' + dalek.format.literal(this.label) + ' created without initializiation callback',
        dalek.Error.PLUGIN_CALL,
        this.called
      );
    }

    this._tasks = [];
  }

  Unit.prototype.options = function(options) {
    if (typeof options === undefined) {
      return _.clone(this._options);
    }

    if (typeof options === 'string') {
      return this._options[options] !== undefined ? this._options[options] : defaultValue;
    }

    _.extend(this._options, options);
  };

  Unit.prototype.initialize = function() {
    this._tasks = this._initialize(this.options);

    if (!Array.isArray(this._tasks)) {
      throw new dalek.Error(
        'Unit ' + dalek.format.literal(this.label) + ' does not provide an array of Tasks',
        dalek.Error.PLUGIN_CALL,
        this.called
      );
    }

    if (!this._tasks.length) {
      throw new dalek.Error(
        'Unit ' + dalek.format.literal(this.label) + ' does not contain any Tasks',
        dalek.Error.PLUGIN_CALL,
        this.called
      );
    }

    dalek.reporter.debug('initialized unit', this.label);
  };

  Unit.prototype.run = function() {
    dalek.reporter.debug('Running Unit', this.label);
  };

  return Unit;
};