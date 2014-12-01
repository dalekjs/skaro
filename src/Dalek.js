'use strict';

// utilities
var Q = require('q');
var _ = require('lodash');
var getStack = require('./util/getStack');
var interceptRegistry = require('./core/Registry.intercept');
// convenience accessors
var _DalekError = require('./core/DalekError');
var _Selector = require('./core/Selector');
var _Handle = require('./core/Handle');
var _RunLoop = require('./core/RunLoop');
// runtime interfaces
var _Endpoint = require('./core/Endpoint');
var _Driver = require('./core/Driver');
var _Proxy = require('./core/Proxy');
var _Format = require('./core/Format');
var _Reporter = require('./core/Reporter');
var _Registry = require('./core/Registry');
var _Suite = require('./core/Suite');
var _Unit = require('./core/Unit');

module.exports = (function(){

  function Dalek(config) {
    this.config = config;
    this._options = config.getOptions();

    this.initialize();
  }

  Dalek.prototype.options = function(options, defaultValue) {
    var _options = this._options;

    // TODO: load options from Suite/Unit when in that mode?
    if (options === undefined) {
      return _.clone(_options);
    }

    if (typeof options === 'string') {
      return _options[options] !== undefined ? _options[options] : defaultValue;
    }

    _.extend(_options, options || {});
  };

  Dalek.prototype.initialize = function() {
    // convenience accessors
    this._ = _;
    this.Q = Q;
    this.getStack = getStack;
    this.Error = _DalekError(this);
    this.Selector = _Selector(this);
    this.Handle = _Handle(this);
    this.RunLoop = _RunLoop(this);
    this.Unit = _Unit(this);
    this.Suite = _Suite(this);

    // runtime interfaces
    // (inherit global config)
    this.endpoint = new (_Endpoint(this))(this._options);
    this.driver = new (_Driver(this))(this._options);
    this.proxy = new (_Proxy(this))(this._options);
    this.format = new (_Format(this))(this._options);
    this.reporter = new (_Reporter(this))(this._options);
    this.registry = new (_Registry(this))(this._options);

    // convenience runtime accessors
    this.registerMacro = this.registry.registerMacro;
    this.registerPlugin = this.registry.registerPlugin;
    this.registerExpectation = this.registry.registerExpectation;

    // runtime data
    this._suites = [];

    this.catch = this.catch.bind(this);
    this.catchStack = this.catchStack.bind(this);

    this.runLoop = new this.RunLoop(this.options());
    this.beforeDalek = this.runLoop.beforeFirst.bind(this.runLoop, 'Dalek.beforeDalek');
    this.beforeSuite = this.runLoop.beforeEach.bind(this.runLoop, 'Dalek.beforeSuite');
    this.afterSuite = this.runLoop.afterEach.bind(this.runLoop, 'Dalek.afterSuite');
    this.afterDalek = this.runLoop.afterLast.bind(this.runLoop, 'Dalek.afterDalek');
  };

  Dalek.prototype._registerPlugins = function(plugins) {
    Object.keys(plugins).forEach(function(namespace) {
      if (this[namespace]) {
        return;
      }

      this[namespace] = interceptRegistry(this, namespace, plugins[namespace]);

      if (this.options('globals') === true) {
        // TODO: move this to start() so it can be reverted in stop()
        this._globalizePlugins(namespace, this[namespace]);
      }
    }.bind(this));
  };

  Dalek.prototype._unregisterPlugins = function() {
    Object.keys(this.registry.plugins).forEach(function(namespace) {
      if (global[namespace] === this[namespace]) {
        delete global[namespace];
      }
    }.bind(this));
  };

  Dalek.prototype._globalizePlugins = function(namespace, plugins) {
    if (global[namespace]) {
      this.reporter.warning(
        /*jshint laxbreak:true */
        'The plugin namespace ' + this.format.literal(namespace)
        + ' cannot be made global because it is already taken, make sure you call '
        + this.format.literal('dalek.' + namespace) + ' instead'
        /*jshint laxbreak:false */
      );
    } else {
      global[namespace] = plugins;
    }

  };

  Dalek.prototype.catch = function(error) {
    // in some promise something went wrong on a script level
    // in this case we need to be clear about what went wrong
    // and halt execution. this is nothing we can recover from
    this.reporter.error(error);

    this.kill();
    process.exit(1);
  };

  Dalek.prototype.catchStack = function(name) {
    return function catchAndLimitStack(error) {
      error.showStackTillName = name;
      this.catch(error);
    }.bind(this);
  };

  Dalek.prototype.suite = function(label, callback) {
    this.reporter.debug('registering suite', label);
    var called = this.getStack(this.suite);
    var suite = new this.Suite(label, this.options(), callback, called);
    this._suites.push(suite);
  };


  Dalek.prototype.load = function() {
    var dalek = this;
    var init = this.config.getInit();
    var groups = [
      this.config.getPlugins(),
      this.config.getTests(),
      this.config.getFiles(),
    ];

    if (init) {
      groups.unshift([init]);
    }

    // load dalek plugins
    this.registry.initialize();
    // load user files
    return this.Q({loaded: [], skipped: [], seen: {}}).then(function(index) {
      dalek.reporter.debug('Loading user files');
      groups.forEach(function(files) {
        files.forEach(function(path) {
          if (index.seen[path]) {
            dalek.reporter.debug('Already examined ' + dalek.format.literal(path));
            return;
          }

          index.seen[path] = true;
          var file = require(path);
          if (typeof file !== 'function') {
            index.skipped.push(path);
            dalek.reporter.warning('Ignoring ' + dalek.format.literal(path) + ' because it is not a function');
            return;
          }

          if (file.length !== 1) {
            index.skipped.push(path);
            dalek.reporter.warning('Ignoring ' + dalek.format.literal(path) + ' because the function does not expect exactly 1 parameter');
            return;
          }

          dalek.reporter.debug('Initializing ' + dalek.format.literal(path));
          file(dalek);
          index.loaded.push(path);
        });
      });

      dalek.reporter.debug('Finished loading user files');
      return index;
    });
  };

  Dalek.prototype.start = function() {
    var deferred = Q.defer();

    // TODO: start all services required to run
    this.proxy.start();
    this.endpoint.initialize('phantomjs').then(function (options) {
      this.driver.initializeWebdriverConnection(options).then(function () {
        deferred.resolve(true);
      });
    }.bind(this));

    return deferred.promise;
  };

  Dalek.prototype.run = function() {
    this.reporter.debug('RUN, FORREST, RUN!');

    this.handle = new this.Handle('Dalek Master Process', this.Handle.DALEK, 'Dalek');
    this.handle.setOperations(this._suites.length);

    this.runLoop.initialize(this.options(), this._suites, this.handle);
    this.runLoop.options({
      sort: this.options('sort.suites')
    });

    this.runLoop.run();
    return this.handle;
  };

  Dalek.prototype.stop = function() {
    this._unregisterPlugins();
    this.endpoint.stop();
    // TODO: gracefully stop all services
    // this should be done with a timeout
    return this.Q(true);
  };

  Dalek.prototype.kill = function() {
    // TODO: kill -9 everything that is still alive
    return this.Q(true);
  };

  Dalek.prototype.endProcess = function() {
    (this.handle || Q.reject()).then(function() {
      process.exit(0);
    }, function() {
      process.exit(1);
    });
  };

  return Dalek;
})();
