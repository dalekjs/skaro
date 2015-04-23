'use strict';

// utilities
var Q = require('q');
var _ = require('lodash');
var getStack = require('./util/getStack');
var interceptRegistry = require('./core/Registry.intercept');
var findInstalledPackages = require('./util/find-installed-packages');
// convenience accessors
var _DalekError = require('./core/DalekError');
var _Selector = require('./core/Selector');
var _Handle = require('./core/Handle');
var _RunLoop = require('./core/RunLoop');
// runtime interfaces
var _Driver = require('./core/Driver');
// var _Proxy = require('./core/Proxy');
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
    this.driver = new (_Driver(this))(this._options);
    // this.proxy = new (_Proxy(this))(this._options);
    this.format = new (_Format(this))(this._options);
    this.reporter = new (_Reporter(this))(this._options);
    this.registry = new (_Registry(this))(this._options);

    // convenience runtime accessors
    this.registerMacro = this.registry.registerMacro;
    this.registerPlugin = this.registry.registerPlugin;
    this.registerExpectation = this.registry.registerExpectation;

    // runtime data
    this._suites = [];
    this.packages = {};

    this.catch = this.catch.bind(this);
    this.catchStack = this.catchStack.bind(this);
    this._loadPackages = this._loadPackages.bind(this);
    this._loadBrowser = this._loadBrowser.bind(this);

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
    }, this);
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
    var userFiles = this._loadUserFiles(groups);
    // load installed bundles
    return this._loadPackages()
      // identify browser binding bundle
      .then(this._loadBrowser)
      // return the user files, because that mapping is not easily acessible
      .thenResolve(userFiles);
  };

  Dalek.prototype._loadUserFiles = function(groups) {
    this.reporter.debug('Loading user files');
    var index = {
      loaded: [],
      skipped: [],
      seen: {}
    };

    groups.forEach(function(files) {
      files.forEach(function(path) {
        if (index.seen[path]) {
          this.reporter.debug('Already examined ' + this.format.literal(path));
          return;
        }

        index.seen[path] = true;
        var file = require(path);
        if (typeof file !== 'function') {
          index.skipped.push(path);
          this.reporter.warning('Ignoring ' + this.format.literal(path) + ' because it is not a function');
          return;
        }

        if (file.length !== 1) {
          index.skipped.push(path);
          this.reporter.warning('Ignoring ' + this.format.literal(path) + ' because the function does not expect exactly 1 parameter');
          return;
        }

        this.reporter.debug('Initializing ' + this.format.literal(path));
        file(this);
        index.loaded.push(path);
      }, this);
    }, this);

    this.reporter.debug('Finished loading user files');
    return index;
  };

  Dalek.prototype._loadPackages = function() {
    this.reporter.debug('Loading list of installed Dalek/Skaro packages');
    return findInstalledPackages(function(packageName) {
      return packageName.slice(0, 5) === 'skaro' || packageName.slice(0, 5) === 'dalek';
    }).then(function(packages) {
      this.packages = packages.map;
      this.reporter.debug('Finished loading list of installed Dalek/Skaro packages');
    }.bind(this));
  };

  Dalek.prototype._loadBrowser = function() {
    var name = this._options.browser;
    if (Array.isArray(name)) {
      name = name[0];
    }

    if (!name) {
      throw new Error('Cannot run without a browser specified!\nsee http://dalekjs.com/docs/config.html#browser');
    }

    this.reporter.debug('Loading Browser');
    // the given browser could be a valid skaro-browser binding
    var packageName = 'skaro-browser-' + name;
    // there may be custom config for running the binding
    var options = this._options['browser.' + name];
    if (options && options['interface']) {
      // the custom config explicitly identifies the skaro-browser binding to use
      packageName = options['interface'];
    }

    if (!this.packages[packageName]) {
      // TODO: warn about "package is not installed"
      throw new Error('Unknown browser "' + name + '"\nsee http://dalekjs.com/docs/config.html#browser');
    }

    // load the binding
    var Browser = require(packageName);
    // initialize the binding (not starting anything yet)
    this.browserProcess = new Browser(options || {}, name);
    this.reporter.debug('Finished loading Browser');
  };

  Dalek.prototype.start = function() {
    var deferred = Q.defer();

    // this.proxy.start();

    this.browserProcess.start(function(options) {
      // options.wd.host, options.wd.port

      this.driver.initializeWebdriverConnection(options.wd).then(deferred.resolve);

    }.bind(this), deferred.reject, this.catch);

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
    var deferred = this.Q.defer();
    this._unregisterPlugins();

    // this.proxy.stop();

    if (!this.browserProcess) {
      return this.Q(true);
    }

    // a browser may not stop in time,
    // in which case we want to kill the process
    var timeout = setTimeout(deferred.reject, 5000);
    deferred.promise.then(function() {
      clearTimeout(timeout);
    });

    this.browserProcess.stop(deferred.resolve);
    return deferred.promise;
  };

  Dalek.prototype.kill = function() {
    // this.proxy.kill();

    if (!this.browserProcess) {
      return this.Q(true);
    }

    this.browserProcess.kill();
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
