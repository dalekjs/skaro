var stackTrace = require('stack-trace');

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
    // exported to dalek.assert
    this.assert = this.assert.bind(this);
  };
  
  Registry.prototype.assert = function(name, meta, handler) {
    dalek.reporter.debug("registering assertion", name);
    if (this.assert[name]) {
      throw new dalek.Error('Assertion plugin »' + name + '« already registered!');
    }

    var unitHandler = this.wrapForUnit(name, meta, handler);
    var registrationHandler = this.wrapForRegistration(name, meta, unitHandler);
    
    this.assert[name] = registrationHandler;
  };
  
  Registry.prototype.wrapForUnit = function(name, meta, handler) {
    return function() {
      dalek.reporter.debug("executing assertion", name);
      //this === unit;
      /*
        options: {
          name: 'attribute-name' // caller
          selector: Selector // caller
          compare: function // caller | generated
          inverted: boolean // caller - comes from assert.not.plugin()
          message: 'text' // caller, optional
        }
       */
      var options =  {
         name: 'attribute-name',
         selector: new dalek.Selector('some-selector'),
         expected: 'Google',
         compare: function(value) { return value === this.expected; },
         inverted: false,
         message: null
       };
      return handler(options);
    };
  };

  Registry.prototype.wrapForRegistration = function(name, meta, handler) {
    return function() {
      dalek.reporter.debug("calling assertion", name);
      var stack = getStack(arguments.callee);
      /*
        options?
      */
      return handler;
    };
  };

  getStack = function(below) {
    // https://github.com/felixge/node-stack-trace
    var stack = [];
    var trace = stackTrace.get(below);

    trace.some(function(callSite) {
      var site = {
        name: callSite.getFunctionName(),
        file: callSite.getFileName(),
        line: callSite.getLineNumber(),
      };

      if (site.name === 'Module._compile') {
        return true;
      }

      stack.push(site);
      return false;
    });

    return stack;
  };

  Registry.prototype.initialize = function(path) {
    // TODO: glob plugins from directory
    // glob('../plugins/**/*.js');
    this.load();
  };
  
  Registry.prototype.load = function(path) {
    require('../plugins/assert/assert.attribute')(dalek);
  };
  
  return Registry;
};