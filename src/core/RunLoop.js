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
    this._runQueue = this._runQueue.bind(this);
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


  RunLoop.prototype._mutedUnit = function(name, unitName, property, handleType, callback, called) {
    dalek.reporter.debug('registering unit', 'before:first', 'as', name);
    if (this[property]) {
      dalek.reporter.warning(name, 'has already been registered in');
      dalek.reporter.printStack(this[property].called, 'warning');
      dalek.reporter.warning('and for a second time in');
      dalek.reporter.printStack(called, 'warning');
    }

    this[property] = new dalek.Unit(unitName, this.options(), callback, called);
    this[property].setHandleType(handleType);
  };

  RunLoop.prototype.beforeFirst = function(name, callback) {
    var called = dalek.getStack(this.beforeFirst);
    this._mutedUnit(name, 'before:first', '_beforeFirst', dalek.Handle.UNIT_BEFORE_FIRST, callback, called);
  };

  RunLoop.prototype.beforeEach = function(name, callback) {
    var called = dalek.getStack(this.beforeEach);
    this._mutedUnit(name, 'before:each', '_beforeEach', dalek.Handle.UNIT_BEFORE_EACH, callback, called);
  };

  RunLoop.prototype.afterEach = function(name, callback) {
    var called = dalek.getStack(this.afterEach);
    this._mutedUnit(name, 'after:each', '_afterEach', dalek.Handle.UNIT_AFTER_EACH, callback, called);
  };

  RunLoop.prototype.afterLast = function(name, callback) {
    var called = dalek.getStack(this.afterLast);
    this._mutedUnit(name, 'after:last', '_afterLast', dalek.Handle.UNIT_AFTER_LAST, callback, called);
  };


  RunLoop.prototype.run = function(options) {
    dalek.reporter.debug('Running', this._handle.name, this._handle.label);

    if (options) {
      this.options(options);
    }

    this.sort();

    setTimeout(this._run);
  };

  RunLoop.prototype.sort = function() {
    function alpha(a) {
      return a.label.toLowerCase();
    }

    switch (this.options('sort')) {
      case 'alpha':
        this._items = _.sortBy(this._items, alpha);
        break;

      case 'random':
        this._items = _.shuffle(this._items);
        break;
    }
  };

  RunLoop.prototype._run = function() {
    this.runBeforeFirst()
      .then(this._runLoop);
  };

  RunLoop.prototype._runLoop = function() {
    var item = this._items.shift();
    if (!item) {
      this.runAfterLast(true).then(function() {
        this._handle.resolve();
      }.bind(this));
      return;
    }

    // TODO: move this type-check
    if (typeof item === 'function') {
      this.runTask(item);
    } else {
      this.runQueue(item);
    }
  };

  RunLoop.prototype.runTask = function(item) {
    this._handle.performOperation();
    var handle;

    try {
      handle = item(this.options());
    } catch (_error) {
      var error = new dalek.Error(
        String(_error),
        dalek.Error.PLUGIN_EXECUTION,
        dalek.getStack(null, _error)
      );
      return dalek.catchStack('RunLoop.runTask')(error);
    }

    if (!(handle instanceof dalek.Handle)) {
      var _handle = new dalek.Handle('non-handle task ' + dalek.format.literal(item), dalek.Handle.ACTION, 'anonymous');
      dalek.Q(handle).then(_handle.resolve, _handle.reject);
      handle = _handle;
    }

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
    // Error in initialization leads to dalek.catch() and ends
    // the process, before we could handle the error here.
    dalek.Q(item.initialize(this.options()))
      .then(this._runQueue);
  };

  RunLoop.prototype._runQueue = function(item) {
    var handle = item.getHandle();
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
    return this.runUnit(this._beforeFirst, true);
  };

  RunLoop.prototype.runBeforeEach = function() {
    return this.runUnit(this._beforeEach, true);
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

    var initOptions = {
      failed: !succeeded
    };

    return unit.initialize(this.options(), initOptions).then(function(unit) {
      unit.run({
        mute: true
      });

      return unit.getHandle();
    }).catch(function(failure) {
      var handle = unit.getHandle();
      // report only in failure case
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
  };


  return RunLoop;
};
