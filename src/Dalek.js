var Q = require('q');

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
  this.options = options;

  this.initialize();
  this.registry.initialize();
}

Dalek.prototype.initialize = function() {
  // convenience accessors
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
  this.assert = this.registry.assert.bind(this.registry);
};

Dalek.prototype.unit = function(label, callback) {
  this.reporter.debug('registering a new Unit');
};

module.exports = Dalek;