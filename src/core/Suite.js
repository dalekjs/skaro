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
    this._beforeUnit = null;
    this._afterUnit = null;

    this._runLoop = this._runLoop.bind(this);
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

    this.handle = new dalek.Handle(this.label, dalek.Handle.SUITE);
    this.handle.setOperations(this._units.length);

    return this.handle;
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

  Suite.prototype.runBeforeUnit = function() {
    return this.runUnitWrapper(this._beforeUnit);
  };

  Suite.prototype.runAfterUnit = function() {
    return this.runUnitWrapper(this._afterUnit);
  };

  Suite.prototype.runUnitWrapper = function(unit) {
    if (!unit) {
      return dalek.Q();
    }

    var unitHandle = unit.initialize();
    unit.run({
      mute: true
    });

    // report only in failure case
    unitHandle.catch(function(failure) {
      dalek.reporter.started(unitHandle);
      dalek.reporter.started(failure);
      dalek.reporter.failed(failure, failure.message);
      dalek.reporter.failed(unitHandle, failure);

      this.handle.reject(unitHandle);
      throw failure;
    }.bind(this));

    return unitHandle;
  };

  Suite.prototype.run = function(options) {
    dalek.reporter.debug('Running Suite', this.label);

    if (options) {
      this.options(options);
    }

    setTimeout(this._runLoop);
    return this.handle;
  };

  Suite.prototype._runLoop = function() {
    var unit = this._units.shift();
    if (!unit) {
      this.handle.resolve();
      return;
    }

    var unitHandle = unit.initialize();
    this.handle.performOperation();

    this.runBeforeUnit().then(function() {
      unit.run();
      dalek.reporter.started(unitHandle);
    }.bind(this));

    var success = function() {
      dalek.reporter.succeeded(unitHandle);
      this.runAfterUnit().then(this._runLoop);
    }.bind(this);

    var failure = function(failure) {
      dalek.reporter.failed(unitHandle, failure);
      this.runAfterUnit().then(this.handle.reject);
    }.bind(this);

    unitHandle
      .then(success, failure)
      .catch(dalek.catch);
  };

  return Suite;
};
