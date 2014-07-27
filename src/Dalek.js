var Q = require('q');

var Driver = require('./core/Driver');
var DalekError = require('./core/DalekError');
var Format = require('./core/Format');
var Selector = require('./core/Selector');
var Assertion = require('./core/Assertion');

function Dalek(options) {
  this.options = options;

  this.initialize();
}

Dalek.prototype.initialize = function() {
  // convenience accessors
  this.Q = Q;
  this.Error = DalekError(this);
  this.Selector = Selector(this);
  this.Assertion = Assertion(this);

  this.driver = new (Driver(this))(this.options);
  this.format = new (Format(this))(this.options);
};

// plugin registration
Dalek.prototype.assert = function() {
  // TODO: the wrapping done in dalek.assert() has to register the function 
  // compare(value) { return options. }
  
};

module.exports = Dalek;