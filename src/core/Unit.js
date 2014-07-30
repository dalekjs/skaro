module.exports = function(dalek) {
  'use strict';

  var _ = dalek._;

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

    this._runLoop = this._runLoop.bind(this);
  }

  Unit.prototype.options = function(options, defaultValue) {
    if (options === undefined) {
      return _.clone(this._options);
    }

    if (typeof options === 'string') {
      return this._options[options] !== undefined ? this._options[options] : defaultValue;
    }

    _.extend(this._options, options);
  };

  Unit.prototype.initialize = function(options) {
    dalek.reporter.debug('initializing unit', this.label);
    this.options(options || {});
    this._tasks = this._initialize(this.options());

    if (!Array.isArray(this._tasks)) {
      throw new dalek.Error(
        'Unit ' + dalek.format.literal(this.label) + ' does not provide an array of Tasks',
        dalek.Error.PLUGIN_CALL,
        this.called
      );
    }

    // Units may be empty because they were conditional, in such a case
    // they should still be logged and not bring down the entire test
    // if (!this._tasks.length) {
    //   throw new dalek.Error(
    //     'Unit ' + dalek.format.literal(this.label) + ' does not contain any Tasks',
    //     dalek.Error.PLUGIN_CALL,
    //     this.called
    //   );
    // }

    this.handle = new dalek.Handle(this.label, dalek.Handle.UNIT);
    this.handle.setOperations(this._tasks.length);

    return this.handle;
  };

  Unit.prototype.run = function(options) {
    dalek.reporter.debug('Running Unit', this.label);

    if (options) {
      this.options(options);
    }

    setTimeout(this._runLoop);
    return this.handle;
  };

  Unit.prototype._runLoop = function() {
    var task = this._tasks.shift();
    if (!task) {
      this.handle.resolve();
      return;
    }

    var taskHandle = task(this.options());
    this.handle.performOperation();

    if (!this.options('mute')) {
      dalek.reporter.started(taskHandle);
    }

    if (taskHandle.type === dalek.Handle.ASSERTION) {
      // TODO: if dalek.options('assertion.faulure') === 'continue';
    }

    var success = function(message) {
      if (!this.options('mute')) {
        dalek.reporter.succeeded(taskHandle, message);
      }

      this._runLoop();
    }.bind(this);

    var failure = function(message) {
      if (!this.options('mute')) {
        dalek.reporter.failed(taskHandle, message);
      }

      this.handle.reject(taskHandle);
    }.bind(this);

    taskHandle
      .then(success, failure)
      .catch(dalek.catch);
  };

  return Unit;
};
