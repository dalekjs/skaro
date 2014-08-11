module.exports = function(dalek) {
  'use strict';

  var _ = dalek._;

  function Unit(label, options, callback, called) {
    this.label = label;
    this._options = options;
    this._initialize = callback.bind(this);
    this.called = called || dalek.getStack(Unit);

    if (typeof callback !== 'function') {
      throw new dalek.Error(
        'Unit ' + dalek.format.literal(this.label) + ' created without initializiation callback',
        dalek.Error.PLUGIN_CALL,
        this.called
      );
    }

    this.initialize = this.initialize.bind(this);
    this.sanitizeTasks = this.sanitizeTasks.bind(this);
    this.initializeUnit = this.initializeUnit.bind(this);

    this.runLoop = new dalek.RunLoop(this.options());
    this.run = this.runLoop.run.bind(this.runLoop);
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
    return dalek.Q(this)
      .then(this._initialize)
      .catch(dalek.catchStack('_fulfilled'))
      .then(this.sanitizeTasks)
      .catch(dalek.catchStack('_fulfilled'))
      .then(this.initializeUnit);
  };

  Unit.prototype.sanitizeTasks = function(tasks) {
    // Units may be empty because they were conditional, in such a case
    // they should still be logged and not bring down the entire test

    if (!Array.isArray(tasks)) {
      throw new dalek.Error(
        'Unit ' + dalek.format.literal(this.label) + ' does not provide an array of Tasks',
        dalek.Error.PLUGIN_CALL,
        this.called
      );
    }

    // we allow nested arrays for a simpler composition of units
    tasks = _.flatten(tasks);

    // a task is a function, nothing else
    tasks.some(function(task) {
      if (typeof task !== 'function') {
        throw new dalek.Error(
          'Unit ' + dalek.format.literal(this.label) + ' contains the invalid task ' + dalek.format.literal(task),
          dalek.Error.PLUGIN_CALL,
          this.called
        );
      }
    }.bind(this));

    // make sure the task list cannot be mutated by some latent async BS beyond this point
    return tasks.slice(0);
  };

  Unit.prototype.initializeUnit = function(tasks) {
    this.handle = new dalek.Handle(this.label, dalek.Handle.UNIT, 'Unit');
    this.handle.setOperations(tasks.length);

    this.runLoop.initialize(this.options(), tasks, this.handle);
    this.runLoop.options({
      sort: 'none'
    });

    // cannot pass a promise because Q would chain that automatically
    return this;
  };


  Unit.prototype.getHandle = function() {
    return this.handle;
  };

  return Unit;
};
