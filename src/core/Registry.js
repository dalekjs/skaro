/*
    The Registry takes care of exposing plugins to the user.
    A plugin is never called directly, it is always accessed
    via a wrapped function provided by the registry. In this
    wrapper things like parameterization, default values and
    simple argument validation are performed. The Registry is
    a bit more complicated so that defining and using plugins
    must not.
 */

var stackTrace = require('stack-trace');

module.exports = function(dalek) {
  var _ = dalek._;

  function Registry(options) {
    // exported to dalek.assert
    this.assert = this.assert.bind(this);
    this.assert.not = {};
  };

  // register an assertion plugin
  Registry.prototype.assert = function(name, meta, handler) {
    this.register('Assertion', 'assert', name, meta, handler);
  };

  // generic plugin registration
  Registry.prototype.register = function(type, namespace, name, meta, handler) {
    dalek.reporter.debug("registering", type, name);

    // there can only be one
    if (this[namespace][name]) {
      throw new dalek.Error(
        format.keyword(type) + ' ' + format.keyword(name) + ' already registered!', 
        dalek.Error.PLUGIN_REGISTRATION
      );
    }

    // make sure the plugin provided all the necessary meta data
    verifyMeta(type, namespace, name, meta, handler);

    // wrap the plugin for execution in a unit
    var unitHandler = this.decorateExecutionTime(type, name, meta, handler);

    // wrap the unit-wrapped plugin so it can be called upon
    this[namespace][name] = this.decorateCallTime(type, name, meta, unitHandler);

    // register inverted assertions
    if (meta.invertable) {
      this[namespace].not[name] = this.decorateCallTime(type, name, meta, unitHandler, true);
    }
  };

  // wrap the actual plugin in a function that can be called at call-time,
  // which then returns a function that can be called at execution-time
  Registry.prototype.decorateExecutionTime = function(type, name, meta, handler) {
    // executed by wrapForRegistration
    return function(calltimeOptions) {
      // executed by unit.run()
      return function(runtimeOptions) {
        dalek.reporter.debug("executing assertion", name);

        // TODO: runtime options
        // like reading from dalek.data(), replacing config placeholders, etc.

        // merge runtime and calltime options, giving calltime precedence
        var options = _.extend({}, calltimeOptions);
        Object.keys(runtimeOptions).forEach(function(key) {
          if (options[key] === null || options[key] === undefined) {
            options[key] = runtimeOptions[key];
          }
        });

        // execute the actual plugin
        return handler(options);
      };
    };
  };

  // wrap the execution-time-wrapped plugin with the necessary wranglers to import
  // call-time parameterization of the plugin
  Registry.prototype.decorateCallTime = function(type, name, meta, unitHandler, inverted) {
    // executed within unit declaration
    var callPlugin = function() {
      dalek.reporter.debug("calling assertion", name);
      // save the stack trace of the plugin-call so the developer
      // can quickly identify where something went wrong in their test
      var stack = getStack(callPlugin);
      // wrangle and test whatever was passed into the plugin call
      var options = getOptions(type, name, meta, arguments, stack);
      // assertions may be invertable
      options.inverted = !!inverted;
      // return the executionTime wrapper for unit.run()
      return unitHandler(options);
    };

    return callPlugin;
  };

  // make sure the plugin's metadata are sound
  function verifyMeta(type, namespace, name, meta, handler) {
    if (!meta.signature) {
      meta.signature = [];
    }

    if (!Array.isArray(meta.signature)) {
      throw new dalek.Error(dalek.format.keyword('meta.signature') + " must be an array");
    }

    if (!meta.required) {
      meta.required = [];
    }

    if (!Array.isArray(meta.required)) {
      throw new dalek.Error(dalek.format.keyword('meta.required') + " must be an array");
    }
  };

  // import call-time parameterization
  function getOptions(type, name, meta, args, stack) {
    var format = dalek.format;
    var options = {
      called: stack,
      selector: null,
      match: 'first',
      timeout: null,
      retry: null,
      message: null,
      // Assertion specific
      expected: null,
      inverted: null,
    };

    if (typeof args[0] === 'array') {
      // TODO: handle multiple execution if meta.multiple allows it
      // this was discussed for until.event() in notes/demo-1.js
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
          // warn when option was specified twice
          if (meta.signature.indexOf(key) !== -1) {
            dalek.reporter.warning(dalek.format.keyword(key) + ' was specified inline and in the options. the inline value is used, the option is ignored.');
            return;
          }

          options[key] = trailingOptions[key];
        });
      }
    }

    // make sure that all the required options are there.
    // since we know nothing about the expected content, 
    // anything but null|undefined is good
    meta.required.forEach(function(key) {
      if (options[key] === undefined || options[key] === null) {
        throw new dalek.Error(
          format.keyword(type) + ' ' + format.keyword(name) + ' required parameter ' + format.keyword(key),
          dalek.Error.PLUGIN_CALL,
          stack
        );
      }
    });

    // prevent inverted calls for plugins that are not invertable
    if (options.inverted && !meta.invertable) {
      throw new dalek.Error(
        format.keyword(type) + ' ' + format.keyword(name) + ' does not support inverted tests',
        dalek.Error.PLUGIN_CALL,
        stack
      );
    }

    // prevent {match:"all"} for plugins that don't support iteration
    if (options.match === 'all' && !meta.iterator) {
      throw new dalek.Error(
        format.keyword(type) + ' ' + format.keyword(name) + ' does not support ' + format.literal('{match: "all"}'),
        dalek.Error.PLUGIN_CALL,
        stack
      );
    }

    // register default comparator for literal values
    if (options.expected !== null && typeof options.expected !== 'function') {
      // TODO: move to dalek.is.equal
      options.expectedValue = options.expected;
      options.expected = function isEqual(value) {
        return value === options.expectedValue
          ? '' :
          ('unexpected ' + dalek.format.literal(value));
      };
      options.expected.displayName = 'equal to ' + dalek.format.literal(options.expectedValue);
    }

    // within a plugin a selector should always be a Selector instance
    if (typeof options.selector === 'string') {
      options.selector = new dalek.Selector(options.selector, dalek.options.selectorStrategy);
    }

    return options;
  };

  // extract the useful (developer-relevant) parts of the call-stack
  // to present in case of problems during plugin call and exection-time
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

      // we don't care about anything deeper than this
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