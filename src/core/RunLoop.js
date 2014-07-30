module.exports = function(dalek) {
  'use strict';

  var _ = dalek._;

  function RunLoop(options) {
    this._options = options || {};
    this._items = null;
    this._handle = null;

    this._beforeFirst = null;
    this._beforeEach = null;
    this._afterEach = null;
    this._afterLast = null;

    this.run = this.run.bind(this);
    this._run = this._run.bind(this);
    this._runLoop = this._runLoop.bind(this);
  }

  RunLoop.prototype.initialize = function(options, items, handle) {
    this.options(options);
    this._items = items;
    this._handle = handle;
  };

  RunLoop.prototype.options = function(options, defaultValue) {
    if (options === undefined) {
      return _.clone(this._options);
    }

    if (typeof options === 'string') {
      return this._options[options] !== undefined ? this._options[options] : defaultValue;
    }

    _.extend(this._options, options);
  };


  RunLoop.prototype.beforeFirst = function(callback) {
    dalek.reporter.debug('registering unit', 'before:first');
    var called = dalek.getStack(this.beforeFirst);
    this._beforeFirst = new dalek.Unit('before:first', this.options(), callback, called);
  };

  RunLoop.prototype.beforeEach = function(callback) {
    dalek.reporter.debug('registering unit', 'before:each');
    var called = dalek.getStack(this.beforeEach);
    this._beforeEach = new dalek.Unit('before:each', this.options(), callback, called);
  };

  RunLoop.prototype.afterEach = function(callback) {
    dalek.reporter.debug('registering unit', 'after:each');
    var called = dalek.getStack(this.afterEach);
    this._afterEach = new dalek.Unit('after:each', this.options(), callback, called);
  };

  RunLoop.prototype.afterLast = function(callback) {
    dalek.reporter.debug('registering unit', 'after:last');
    var called = dalek.getStack(this.afterLast);
    this._afterLast = new dalek.Unit('after:last', this.options(), callback, called);
  };


  RunLoop.prototype.run = function(options) {
    dalek.reporter.debug('Running', this._handle.name, this._handle.label);

    if (options) {
      this.options(options);
    }

    setTimeout(this._run);
  };

  RunLoop.prototype._run = function() {
    this.runBeforeFirst()
      .then(this._runLoop)
      .catch(dalek.catch);
  };

  RunLoop.prototype._runLoop = function() {
    var item = this._items.shift();
    if (!item) {
      this.runAfterLast(true).then(function() {
        this._handle.resolve();
      }.bind(this));
      return;
    }

    if (typeof item === 'function') {
      this.runTask(item);
    } else {
      this.runQueue(item);
    }
  };

  RunLoop.prototype.runTask = function(item) {
    var handle = item(this.options());
    this._handle.performOperation();

    if (!this.options('mute')) {
      dalek.reporter.started(handle);
    }

    if (handle.type === dalek.Handle.ASSERTION) {
      // TODO: if dalek.options('assertion.faulure') === 'continue';
    }

    var success = function(message) {
      if (!this.options('mute')) {
        dalek.reporter.succeeded(handle, message);
      }

      this._runLoop();
    }.bind(this);

    var failure = function(message) {
      if (!this.options('mute')) {
        dalek.reporter.failed(handle, message);
      }

      this.runAfterLast(false).then(function() {
        this._handle.reject(handle);
      }.bind(this));
    }.bind(this);

    handle
      .then(success, failure)
      .catch(dalek.catch);
  };

  RunLoop.prototype.runQueue = function(item) {
    var handle = item.initialize(this.options());
    this._handle.performOperation();

    this.runBeforeEach().then(function() {
      item.run();
      dalek.reporter.started(handle);
    }.bind(this));

    var success = function() {
      dalek.reporter.succeeded(handle);
      this.runAfterEach(true).then(this._runLoop);
    }.bind(this);

    var failure = function(failure) {
      dalek.reporter.failed(handle, failure);
      this.runAfterEach(false).then(function() {
        this.runAfterLast(false);
      }.bind(this)).then(function() {
        this._handle.reject(handle);
      }.bind(this));
    }.bind(this);

    handle
      .then(success, failure)
      .catch(dalek.catch);
  };


  RunLoop.prototype.runBeforeFirst = function() {
    return this.runUnit(this._beforeFirst);
  };

  RunLoop.prototype.runBeforeEach = function() {
    return this.runUnit(this._beforeEach);
  };

  RunLoop.prototype.runAfterEach = function(succeeded) {
    return this.runUnit(this._afterEach, succeeded);
  };

  RunLoop.prototype.runAfterLast = function(succeeded) {
    return this.runUnit(this._afterLast, succeeded);
  };

  RunLoop.prototype.runUnit = function(unit, succeeded) {
    if (!unit) {
      return dalek.Q();
    }

    var options = this.options();
    options.succeeded = succeeded;

    var handle = unit.initialize(options);
    unit.run({
      mute: true
    });

    // report only in failure case
    handle.catch(function(failure) {
      dalek.reporter.started(handle);
      dalek.reporter.started(failure);
      dalek.reporter.failed(failure, failure.message);
      dalek.reporter.failed(handle, failure);
      if (!succeeded) {
        // do not reject if we're cleaning up after
        // an error
        return;
      }

      this._handle.reject(handle);
      throw failure;
    }.bind(this));

    return handle;
  };


  return RunLoop;
};
