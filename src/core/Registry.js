/*
    The Registry takes care of exposing plugins to the user.
    A plugin is never called directly, it is always accessed
    via a wrapped function provided by the registry. In this
    wrapper things like parameterization, default values and
    simple argument validation are performed. The Registry is
    a bit more complicated so that defining and using plugins
    must not.


    while the process of wrapping and unwrapping plugin handlers
    may look complicated, the following behavior is the result:

    var plugin = dalek.assert.attribute({ calltimeOptions });
    var handle = plugin({ runtimeOptions });
    handle.then(successHandler, errorHandler);
 */

module.exports = function(dalek) {
  'use strict';

  var path = require('path');

  var glob = require('glob');
  var _ = dalek._;

  function Registry(options) {
    this.options = options;
    this.plugins = {
      assert: {
        not: {}
      },
      'is': {
        not: {}
      },
      action: {},
      until: {},
    };

    this.registerPlugin = this.registerPlugin.bind(this);
    this.registerExpectation = this.registerExpectation.bind(this);
  }

  Registry.prototype.registerPlugin = function(meta, handler) {
    dalek.reporter.debug('registering', meta.namespace, meta.name);

    // make sure the plugin provided all the necessary meta data
    verifyMeta(meta, handler);

    if (this.plugins[meta.namespace] === undefined) {
      this.plugins[meta.namespace] = {};
    }

    // there can only be one
    if (this.plugins[meta.namespace][meta.name]) {
      throw new dalek.Error(
        dalek.format.keyword(meta.namespace) + ' ' + dalek.format.keyword(meta.name) + ' already registered!', 
        dalek.Error.PLUGIN_REGISTRATION
      );
    }

    // wrap the plugin for execution in a unit
    var unitHandler = this.decorateExecutionTime(meta, handler);

    // wrap the unit-wrapped plugin so it can be called upon
    this.plugins[meta.namespace][meta.name] = this.decorateCallTime(meta, unitHandler);

    // register inverted assertions
    if (meta.invertable && meta.namespace === 'assert') {
      this.plugins[meta.namespace].not[meta.name] = this.decorateCallTime(meta, unitHandler, true);
    }

    // export plugin to dalek
    dalek._registerPlugins(this.plugins);
  };

  Registry.prototype.registerExpectation = function(meta, handler) {
    dalek.reporter.debug('registering', 'expectation', meta.name);

    // make sure the plugin provided all the necessary meta data
    meta.namespace = 'is';
    verifyMeta(meta, handler);

    // there can only be one
    if (this.plugins.is[meta.name]) {
      throw new dalek.Error(
        dalek.format.keyword('Expectation') + ' ' + dalek.format.keyword(meta.name) + ' already registered!',
        dalek.Error.PLUGIN_REGISTRATION
      );
    }

    var unitHandler = function(options) {
      var expectation = function(value) {
        dalek.reporter.debug('executing', 'expectation', meta.name);
        options.value = value;
        return handler(options);
      };

      if (typeof meta.displayName === 'function') {
        expectation.displayName = meta.displayName(options);
      } else {
        expectation.displayName = meta.displayName;
      }

      return expectation;
    };

    this.plugins.is[meta.name] = this.decorateCallTime(meta, unitHandler);

    if (meta.invertable) {
      this.plugins.is.not[meta.name] = this.decorateCallTime(meta, unitHandler, true);
    }

    // export plugin to dalek
    dalek._registerPlugins(this.plugins);
  };

  // wrap the actual plugin in a function that can be called at call-time,
  // which then returns a function that can be called at execution-time
  Registry.prototype.decorateExecutionTime = function(meta, handler) {
    // executed by wrapForRegistration
    return function(calltimeOptions) {
      // executed by unit.run()
      return function(runtimeOptions) {
        dalek.reporter.debug('executing plugin', meta.name);

        // TODO: runtime options
        // like reading from dalek.data(), replacing config placeholders, etc.

        // merge runtime and calltime options, giving calltime precedence
        var options = _.extend({}, calltimeOptions);
        Object.keys(runtimeOptions).forEach(function(key) {
          if (options[key] === null || options[key] === undefined) {
            options[key] = runtimeOptions[key];
          }
        });

        /*
          // TODO: implement retry
          // retry handling cannot like this because we have to return the handle, not a promise
          // but really this would be the place it should be done, because timeout() handling is
          // done here as well…

          return handle.catch(function(error) {
            if (!options.retry || meta.retry === false) {
              throw error;
            }

            options.retry -= 1;
            var retryHandle = executeHandler(options);
            dalek.reporter.retried(handle, retryHandle);
            return retryHandle;
          });
        */

        // execute the actual plugin
        var handle = handler(options);
        // make sure it can't run forever (unless it does so synchronously)
        meta.timeout !== false && options.timeout && handle.timeout(options.timeout);

        return handle;
      };
    };
  };

  // wrap the execution-time-wrapped plugin with the necessary wranglers to import
  // call-time parameterization of the plugin
  Registry.prototype.decorateCallTime = function(meta, unitHandler, inverted) {
    // executed within unit declaration
    var callPlugin = function() {
      dalek.reporter.debug('calling plugin', meta.name);
      // save the stack trace of the plugin-call so the developer
      // can quickly identify where something went wrong in their test
      var stack = dalek.getStack(callPlugin);
      // wrangle and test whatever was passed into the plugin call
      var options = getOptions(meta, arguments, stack);
      // assertions and expectations may be invertable
      options.inverted = !!inverted;
      // return the executionTime wrapper for unit.run()
      return unitHandler(options);
    };

    return callPlugin;
  };

  // make sure the plugin's metadata are sound
  function verifyMeta(meta /*, handler*/) {
    if (!meta.namespace) {
      throw new dalek.Error(
        dalek.format.keyword('meta.namespace') + ' must be specified',
        dalek.Error.PLUGIN_REGISTRATION
      );
    }

    if (!meta.name) {
      throw new dalek.Error(
        dalek.format.keyword('meta.name') + ' must be specified',
        dalek.Error.PLUGIN_REGISTRATION
      );
    }

    if (!meta.signature) {
      meta.signature = [];
    }

    if (!Array.isArray(meta.signature)) {
      throw new dalek.Error(
        dalek.format.keyword('meta.signature') + ' must be an array',
        dalek.Error.PLUGIN_REGISTRATION
      );
    }

    if (!meta.required) {
      meta.required = [];
    }

    if (!Array.isArray(meta.required)) {
      throw new dalek.Error(
        dalek.format.keyword('meta.required') + ' must be an array',
        dalek.Error.PLUGIN_REGISTRATION
      );
    }
  }

  // import call-time parameterization
  function getOptions(meta, args, stack) {
    var format = dalek.format;
    var options = {
      // generated options
      called: stack,
      arguments: [].slice.call(args, 0),
      // generic plugin options
      selector: null,
      match: 'first',
      timeout: null,
      // TODO: implement retry
      retry: null,
      message: null,
      // Assertion and Expectation specific options
      expected: null,
      inverted: null,
    };

    if (Array.isArray(args[0])) {
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
      if (meta.signature.length === args.length -1 && typeof trailingOptions === 'object') {
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
          format.keyword(meta.namespace) + ' ' + format.keyword(meta.name) + ' requires parameter ' + format.keyword(key),
          dalek.Error.PLUGIN_CALL,
          stack
        );
      }
    });

    // prevent inverted calls for plugins that are not invertable
    if (options.inverted && !meta.invertable) {
      throw new dalek.Error(
        format.keyword(meta.namespace) + ' ' + format.keyword(meta.name) + ' does not support inverted tests',
        dalek.Error.PLUGIN_CALL,
        stack
      );
    }

    // prevent {match:"all"} for plugins that don't support iteration
    if (options.match === 'all' && !meta.iterator) {
      throw new dalek.Error(
        format.keyword(meta.namespace) + ' ' + format.keyword(meta.name) + ' does not support ' + format.literal('{match: "all"}'),
        dalek.Error.PLUGIN_CALL,
        stack
      );
    }

    // register default comparator for literal values
    if (meta.namespace !== 'is' && options.expected !== null && typeof options.expected !== 'function') {
      options.expected = dalek.is.equal(options.expected);
    }

    // within a plugin a selector should always be a Selector instance
    if (typeof options.selector === 'string') {
      options.selector = new dalek.Selector(options.selector, dalek.options('selectorStrategy'));
    }

    return options;
  }

  Registry.prototype.initialize = function() {
    // TODO: windows compatible paths
    glob.sync(path.resolve(__dirname, '../plugins/**/*.js'), {silent: true, strict: true})
      .forEach(this.load.bind(this));
  };

  Registry.prototype.load = function(path) {
    require(path)(dalek);
  };

  return Registry;
};