module.exports = function(dalek) {
  'use strict';

  var _ = dalek._;

  function Suite(label, options, callback, called) {
    this.label = label;
    this._options = options;
    this._initialize = callback.bind(this);
    this.called = called || dalek.getStack(Suite);

    if (typeof callback !== 'function') {
      throw new dalek.Error(
        'Suite ' + dalek.format.literal(this.label) + ' created without initializiation callback',
        dalek.Error.PLUGIN_CALL,
        this.called
      );
    }

    this._units = [];

    this.sanitizeUnits = this.sanitizeUnits.bind(this);
    this.initializeSuite = this.initializeSuite.bind(this);

    this.runLoop = new dalek.RunLoop(this.options());
    this.run = this.runLoop.run.bind(this.runLoop);
    this.beforeSuite = this.runLoop.beforeFirst.bind(this.runLoop, 'Suite.beforeSuite');
    this.beforeUnit = this.runLoop.beforeEach.bind(this.runLoop, 'Suite.beforeUnit');
    this.afterUnit = this.runLoop.afterEach.bind(this.runLoop, 'Suite.afterUnit');
    this.afterSuite = this.runLoop.afterLast.bind(this.runLoop, 'Suite.afterSuite');
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


  Suite.prototype.initialize = function(options) {
    dalek.reporter.debug('initializing suite', this.label);
    this.options(options || {});
    return dalek.Q(this)
      .then(this._initialize)
      .catch(dalek.catchStack('_fulfilled'))
      .then(this.sanitizeUnits)
      .catch(dalek.catchStack('_fulfilled'))
      .then(this.initializeSuite);
  };

  Suite.prototype.sanitizeUnits = function() {
    if (!this._units.length) {
      throw new dalek.Error(
        'Suite ' + dalek.format.literal(this.label) + ' does not contain any Units',
        dalek.Error.PLUGIN_CALL,
        this.called
      );
    }
  };

  Suite.prototype.initializeSuite = function() {
    this.handle = new dalek.Handle(this.label, dalek.Handle.SUITE, 'Suite');
    this.handle.setOperations(this._units.length);

    this.runLoop.initialize(this.options(), this._units, this.handle);
    this.runLoop.options({
      sort: this.options('sort.units')
    });

    return this;
  };


  Suite.prototype.getHandle = function() {
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
