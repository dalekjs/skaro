module.exports = function(dalek) {
  'use strict';

  var _ = dalek._;
  var Q = dalek.Q;

  function Suite(label, options, callback, called) {
    this.label = label;
    this._options = options;
    this._initialize = callback;
    this.called = called || dalek.getStack(Suite);

    if (typeof callback !== 'function') {
      throw new dalek.Error(
        'Suite ' + dalek.format.literal(this.label) + ' created without initializiation callback',
        dalek.Error.PLUGIN_CALL,
        this.called
      );
    }

    this._units = [];
    this._beforeUnit = null;
    this._afterUnit = null;
  }

  Suite.prototype.options = function(options) {
    if (typeof options === undefined) {
      return _.clone(this._options);
    }

    if (typeof options === 'string') {
      return this._options[options] !== undefined ? this._options[options] : defaultValue;
    }

    _.extend(this._options, options);
  };

  Suite.prototype.initialize = function() {
    this._initialize(this, this.options);

    if (!this._units.length) {
      throw new dalek.Error(
        'Suite ' + dalek.format.literal(this.label) + ' does not contain any Units',
        dalek.Error.PLUGIN_CALL,
        this.called
      );
    }

    dalek.reporter.debug('initialized suite', this.label);
  };

  Suite.prototype.unit = function(label, callback) {
    dalek.reporter.debug('registering unit', label);
    var called = dalek.getStack(this.unit);
    var unit = new dalek.Unit(label, this.options(), callback, called);
    this._units.push(unit);
  };

  Suite.prototype.beforeUnit = function(callback) {
    dalek.reporter.debug('registering unit', 'before:suite');
    var called = dalek.getStack(this.beforeUnit);
    this._beforeUnit = new dalek.Unit('before:suite', this.options(), callback, called);
  };

  Suite.prototype.afterUnit = function(callback) {
    dalek.reporter.debug('registering unit', 'after:suite');
    var called = dalek.getStack(this.afterUnit);
    this._afterUnit = new dalek.Unit('after:suite', this.options(), callback, called);
  };

  Suite.prototype.run = function() {
    dalek.reporter.debug('Running Suite', this.label);
  };

  return Suite;
};