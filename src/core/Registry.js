module.exports = function(dalek) {
  
  /*
    ### REGISTRATION TIME ###  
    
    * message bus
    * enable .not.foo if meta.invertable
    * prevent options.match == "all" if meta.iterator
    * generate simple function from meta.signature
    * capture registration stack
    * capture registration stack
  
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
  function Registry(options) {
    
  };
  
  Registry.prototype.assert = function(name, meta, handler) {
    dalek.reporter.debug("registering assertion", name);

    

  };
  
  Registry.prototype.wrap = function(name, meta, handler) {
    return function(unit) {
      
    }.bind()
  };
  
  Registry.prototype.initialize = function(path) {
    // TODO: glob plugins from directory
    // glob('../plugins/**/*.js');
    this.load();
  };
  
  Registry.prototype.load = function(path) {
    require('../plugins/assert/assert.attribute')(this);
  };
  
  return Registry;
};