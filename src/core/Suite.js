module.exports = function(dalek) {
  'use strict';

  var _ = dalek._;

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

    this.runLoop = new dalek.RunLoop(this.options());
    this.run = this.runLoop.run.bind(this.runLoop);
    this.beforeUnit = this.runLoop.beforeEach.bind(this.runLoop);
    this.afterUnit = this.runLoop.afterEach.bind(this.runLoop);
  }

  Suite.prototype.options = function(options, defaultValue) {
    if (options === undefined) {
      return _.clone(this._options);
    }

    if (typeof options === 'string') {
      return this._options[options] !== undefined ? this._options[options] : defaultValue;
    }

    _.extend(this._options, options);
  };

  Suite.prototype.initialize = function() {
    dalek.reporter.debug('initializing suite', this.label);
    this._initialize(this, this.options);

    if (!this._units.length) {
      throw new dalek.Error(
        'Suite ' + dalek.format.literal(this.label) + ' does not contain any Units',
        dalek.Error.PLUGIN_CALL,
        this.called
      );
    }

    this.handle = new dalek.Handle(this.label, dalek.Handle.SUITE, 'Suite');
    this.handle.setOperations(this._units.length);

    this.runLoop.initialize(this.options(), this._units, this.handle);

    return this.handle;
  };

  Suite.prototype.unit = function(label, callback) {
    dalek.reporter.debug('registering unit', label);
    var called = dalek.getStack(this.unit);
    var unit = new dalek.Unit(label, this.options(), callback, called);
    this._units.push(unit);
  };

  return Suite;
};
