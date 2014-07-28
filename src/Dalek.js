var Q = require('q');
var _ = require('lodash');

// convenience accessors
var _DalekError = require('./core/DalekError');
var _Selector = require('./core/Selector');
var _Handle = require('./core/Handle');
// runtime interfaces
var _Driver = require('./core/Driver');
var _Format = require('./core/Format');
var _Reporter = require('./core/Reporter');
var _Registry = require('./core/Registry');
var _Unit = require('./core/Unit');

module.exports = (function(){
  'use strict';

  function Dalek(options) {
    this.options = _.extend({}, Dalek.defaults);
    _.extend(this.options, options);

    this.initialize();
    this.registry.initialize();
  }

  Dalek.defaults = {
    selectorStrategy: 'css'
  };

  Dalek.prototype.initialize = function() {
    // convenience accessors
    this._ = _;
    this.Q = Q;
    this.Error = _DalekError(this);
    this.Selector = _Selector(this);
    this.Handle = _Handle(this);
    this.Unit = _Unit(this);

    // runtime interfaces
    this.driver = new (_Driver(this))(this.options);
    this.format = new (_Format(this))(this.options);
    this.reporter = new (_Reporter(this))(this.options);
    this.registry = new (_Registry(this))(this.options);

    // convenience runtime accessors
    this.assert = this.registry.assert;
    this.action = this.registry.action;
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

  Dalek.prototype.unit = function(/*label, callback*/) {
    this.reporter.debug('registering a new Unit');
  };

  return Dalek;
})();