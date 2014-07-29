'use strict';

// utilities
var Q = require('q');
var _ = require('lodash');
var getStack = require('./util/getStack');
// convenience accessors
var _DalekError = require('./core/DalekError');
var _Selector = require('./core/Selector');
var _Handle = require('./core/Handle');
// runtime interfaces
var _Driver = require('./core/Driver');
var _Format = require('./core/Format');
var _Reporter = require('./core/Reporter');
var _Registry = require('./core/Registry');
var _Suite = require('./core/Suite');
var _Unit = require('./core/Unit');

module.exports = (function(){
  'use strict';

  function Dalek(options) {
    // TODO: figure out where default options come from
    this._options = _.extend({}, Dalek.defaults);
    _.extend(this._options, options);

    this.initialize();
    this.registry.initialize();
  }

  Dalek.defaults = {
    selectorStrategy: 'css'
  };

  Dalek.prototype.options = function(options, defaultValue) {
    var _options = this._options;

    // TODO: load options from Suite/Unit when in that mode?

    if (typeof options === undefined) {
      return _.clone(_options);
    }

    if (typeof options === 'string') {
      return _options[options] !== undefined ? _options[options] : defaultValue;
    }

    _.extend(_options, options || {});
  };

  Dalek.prototype.initialize = function() {
    // convenience accessors
    this._ = _;
    this.Q = Q;
    this.getStack = getStack;
    this.Error = _DalekError(this);
    this.Selector = _Selector(this);
    this.Handle = _Handle(this);
    this.Unit = _Unit(this);
    this.Suite = _Suite(this);

    // runtime interfaces
    this.driver = new (_Driver(this))(this.options);
    this.format = new (_Format(this))(this.options);
    this.reporter = new (_Reporter(this))(this.options);
    this.registry = new (_Registry(this))(this.options);

    // convenience runtime accessors
    this.registerPlugin = this.registry.registerPlugin;
    this.registerExpectation = this.registry.registerExpectation;

    // runtime data
    this._suites = [];
  };

  Dalek.prototype._registerPlugins = function(plugins) {
    Object.keys(plugins).forEach(function(namespace) {
      this[namespace] = plugins[namespace];
    }.bind(this));
  };

  Dalek.prototype.catch = function(error) {
    // in some promise something went wrong on a script level
    // in this case we need to be clear about what went wrong
    // and halt execution. this is nothing we can recover from
    this.reporter.error(error);

    // TODO: check if we need proper exit codes for different situations
    // e.g. http://docs.openlinksw.com/virtuoso/signalsandexitcodes.html
    this.reporter.log('\n\naborting Dalek because of script error in promise');
    process.exit(1);
  };

  Dalek.prototype.suite = function(label, callback) {
    this.reporter.debug('registering suite', label);
    var called = this.getStack(this.suite);
    var suite = new this.Suite(label, this.options(), callback, called);
    this._suites.push(suite);
  };

  Dalek.prototype.run = function() {
    this.reporter.debug('RUN, FORREST, RUN!');

    // TODO: figure out what needs to be run here
    // this._runSuites();
  };

  Dalek.prototype._runSuites = function() {
    this.reporter.debug('Dalek running Suites');

    this._suites.forEach(function(suite) {
      //this.reporter.debug('initializ, waaah');

      suite.initialize();
    }.bind(this));
  };

  return Dalek;
})();