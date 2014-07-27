var Q = require('q');

// convenience accessors
var DalekError = require('./core/DalekError');
var Selector = require('./core/Selector');
var Assertion = require('./core/Assertion');
// runtime interfaces
var Driver = require('./core/Driver');
var Format = require('./core/Format');
var Reporter = require('./core/Reporter');

function Dalek(options) {
  this.options = options;

  this.initialize();
  this.loadPlugins();
}

Dalek.prototype.initialize = function() {
  // convenience accessors
  this.Q = Q;
  this.Error = DalekError(this);
  this.Selector = Selector(this);
  this.Assertion = Assertion(this);

  // runtime interfaces
  this.driver = new (Driver(this))(this.options);
  this.format = new (Format(this))(this.options);
  this.reporter = new (Reporter(this))(this.options);
};

// plugin registration
Dalek.prototype.assert = function() {
  /*
    ### REGISTRATION TIME ###  
    
    * message bus
    * 
    
  
    ### CALL TIME ###
    options: {
      name: 'attribute-name' // caller
      selector: Selector // caller
      compare: function // caller | generated
      inverted: boolean // caller - comes from assert.not.plugin()
      message: 'text' // caller, optional
    }
    returns promise like object
   */
   
   

  this.reporter.debug("dalek.assert()", arguments);
};

Dalek.prototype.loadPlugins = function(path) {
  require('./plugins/assert/assert.attribute')(this);
};

module.exports = Dalek;