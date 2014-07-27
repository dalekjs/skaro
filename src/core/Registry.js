var stackTrace = require('stack-trace');

module.exports = function(dalek) {
  var _ = dalek._;
  /*
    ### REGISTRATION TIME ###

    * message bus
    * enable .not.foo if meta.invertable

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
    this.assert.not = {};
  };

  Registry.prototype.assert = function(name, meta, handler) {
    this.register('Assertion', 'assert', name, meta, handler);
  };

  Registry.prototype.register = function(type, namespace, name, meta, handler) {
    dalek.reporter.debug("registering", type, name);
    if (this[namespace][name]) {
      throw new dalek.Error(type + ' »' + name + '« already registered!');
    }

    verifyMeta(type, namespace, name, meta, handler);

    var unitHandler = this.wrapForUnit(type, name, meta, handler);

    this[namespace][name] = this.wrapForRegistration(type, name, meta, unitHandler);

    if (meta.invertable) {
      this[namespace].not[name] = this.wrapForRegistrationInverted(type, name, meta, unitHandler);
    }
  };

  Registry.prototype.wrapForUnit = function(type, name, meta, handler) {
    // executed by wrapForRegistration
    return function(options) {
      // executed by unit.run()
      return function() {
        dalek.reporter.debug("executing assertion", name);

        // TODO: runtime options
        // like reading from dalek.data(), replacing config placeholders, etc.

        return handler(options);
      };
    };
  };

  Registry.prototype.wrapForRegistration = function(type, name, meta, unitHandler) {
    // executed within unit declaration
    var callPlugin = function() {
      dalek.reporter.debug("calling assertion", name);
      var stack = getStack(callPlugin);
      var options = getOptions(type, name, meta, arguments, stack);
      return unitHandler(options);
    };

    return callPlugin;
  };

  Registry.prototype.wrapForRegistrationInverted = function(type, name, meta, unitHandler) {
    // executed within unit declaration
    var callPlugin = function() {
      dalek.reporter.debug("calling assertion", name);
      var stack = getStack(callPlugin);
      var options = getOptions(type, name, meta, arguments, stack);
      options.inverted = true;
      return unitHandler(options);
    };

    return callPlugin;
  };

  function verifyMeta(type, namespace, name, meta, handler) {
    if (!meta.signature) {
      meta.signature = [];
    }

    if (!Array.isArray(meta.signature)) {
      throw new dalek.Error("meta.signature must be an array");
    }

    if (!meta.required) {
      meta.required = [];
    }

    if (!Array.isArray(meta.required)) {
      throw new dalek.Error("meta.required must be an array");
    }
  };

  function getOptions(type, name, meta, args, stack) {
    var format = dalek.format;
    var options = {
      called: stack,
      selector: null,
      match: 'first',
      expected: null,
      compare: null,
      inverted: null,
      message: null
    };

    if (typeof args[0] === 'array') {
      // TODO: handle multiple execution if meta.multiple allows it
      throw new dalek.Error(
        'cannot handle mutliple occurences of the same test yet',
        dalek.Error.PLUGIN_CALL,
        stack
      );
    }

    if (typeof args[0] === 'object') {
      // e.g. assert.foo({ selector: '.selector', timeout: 123 })
      _.extend(options, args[0]);
    } else {
      // e.g. assert.foo('.selector')
      meta.signature.forEach(function(key, index) {
        options[key] = args[index];
      });
      // e.g. assert.foo('.selector', { timeout: 123 })
      var trailingOptions = args[args.length -1];
      if (meta.signature.length == args.length -1 && typeof trailingOptions === 'object') {
        Object.keys(trailingOptions).forEach(function(key) {
          if (meta.signature.indexOf(key) !== -1) {
            dalek.reporter.warning(dalek.format.keyword(key) + ' was specified inline and in the options. the inline value is used, the option is ignored.');
            return;
          }

          options[key] = trailingOptions[key];
        });
      }
    }

    meta.required.forEach(function(key) {
      if (options[key] === undefined || options[key] === null) {
        throw new dalek.Error(
          format.keyword(type) + ' ' + format.keyword(name) + ' required parameter ' + format.keyword(key),
          dalek.Error.PLUGIN_CALL,
          stack
        );
      }
    });

    if (options.inverted && !meta.invertable) {
      throw new dalek.Error(
        format.keyword(type) + ' ' + format.keyword(name) + ' does not support inverted tests',
        dalek.Error.PLUGIN_CALL,
        stack
      );
    }

    if (options.match === 'all' && !meta.iterator) {
      throw new dalek.Error(
        format.keyword(type) + ' ' + format.keyword(name) + ' does not support ' + format.literal('{match: "all"}'),
        dalek.Error.PLUGIN_CALL,
        stack
      );
    }

    if (typeof expected !== 'function') {
      // TODO: move to dalek.is.equal
      options.expectedValue = options.expected;
      options.expected = function isEqual(value) {
        return value === options.expectedValue
          ? '' :
          ('unexpected ' + dalek.format.literal(value));
      };
      options.expected.displayName = 'equal to ' + dalek.format.literal(options.expectedValue);

      console.log(options.expected.displayName);
    }

    if (typeof options.selector === 'string') {
      options.selector = new dalek.Selector(options.selector, dalek.options.selectorStrategy)
    }

    return options;
  };

  function getStack(below) {
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