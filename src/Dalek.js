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
  this.Selector = Selector;
  this.Assertion = Assertion;
  this.Q = Q;

  this.driver = new Driver(this.options);
  this.format = new Format(this.options);
}

// plugin registration
Dalek.protoype.assert = function() {
  // TODO: the wrapping done in dalek.assert() has to register the function 
  // compare(value) { return options. }
  
};

module.exports = Dalek;