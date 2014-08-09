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

    this.handle = new dalek.Handle(this.label, dalek.Handle.UNIT, 'Unit');
    this.handle.setOperations(this._tasks.length);

    this.runLoop.initialize(this.options(), this._tasks, this.handle);
    this.runLoop.options({
      sort: 'none'
    });

    return this.handle;
  };

  return Unit;
};
