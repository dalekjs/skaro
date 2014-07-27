var Q = require('q');
var _ = require('lodash');

// convenience accessors
var DalekError = require('./core/DalekError');
var Selector = require('./core/Selector');
var Assertion = require('./core/Assertion');
// runtime interfaces
var Driver = require('./core/Driver');
var Format = require('./core/Format');
var Reporter = require('./core/Reporter');
var Registry = require('./core/Registry');
var Unit = require('./core/Unit');

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
  this.Error = DalekError(this);
  this.Selector = Selector(this);
  this.Assertion = Assertion(this);
  this.Unit = new Unit(this);

  // runtime interfaces
  this.driver = new (Driver(this))(this.options);
  this.format = new (Format(this))(this.options);
  this.reporter = new (Reporter(this))(this.options);
  this.registry = new (Registry(this))(this.options);

  // convenience runtime accessors
  this.assert = this.registry.assert;
};

Dalek.prototype.catch = function(error) {
  // in some promise something went wrong on a script level
  // in this case we need to be clear about what went wrong
  // and halt execution. this is nothing we can recover from
  console.error(error.stack);

  // TODO: check if we need proper exit codes for different situations
  // e.g. http://docs.openlinksw.com/virtuoso/signalsandexitcodes.html
  console.log("\n\naborting Dalek because of script error in promise");
  process.exit(1);
};

Dalek.prototype.unit = function(label, callback) {
  this.reporter.debug('registering a new Unit');
};

module.exports = Dalek;