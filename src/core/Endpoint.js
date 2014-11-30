module.exports = function(dalek) {
  'use strict';

  var fs = require('fs');
  var path = require('path');
  var _ = require('lodash');
  var globule = require('globule');

  function Endpoint (options) {
    this.options = options;

    // directory patterns our browser modules use
    this.patterns = ['skaro-browser-*'];

    // scan for browser plugins
    this.browsers = this.getInstalledBrowserBindings(this.patterns);
  };

  Endpoint.prototype.getInstalledBrowserBindings = function (patterns) {
    var bindings = [];
    var modules = [];

    // collect all modules from all known node_modules folders
    require.main.paths.forEach(function (modulesDir) {
      if (fs.existsSync(modulesDir)) {
        modules = _.union(modules, fs.readdirSync(modulesDir).filter(function (file) {
          var folder = modulesDir + path.sep + file;
          return fs.existsSync(folder) ? fs.statSync(folder).isDirectory() : false;
        }));
      }
    });

    // return all bindings that survived the pattern matching
    var survivors = globule.match(patterns, modules);

    survivors.forEach(function (survivor) {
      patterns.forEach(function (pattern) {
        var patternWithoutWildcard = pattern.replace('*', '');
        var browserId = survivor.replace(patternWithoutWildcard, '');
        if (browserId.search(patternWithoutWildcard) === -1) {
          bindings.push({id: browserId, module: require(survivor)(dalek) });
        }
      });
    });

    return bindings;
  };

  Endpoint.prototype.initialize = function (browserName) {
      var deferred = dalek.Q.defer();
      this.loadBrowser(browserName).then(function (data) {
        var isValid = data[0];
        var browserInstance = data[1];

        if (isValid !== true) {
          deferred.reject('Unknown browser ' + browserName);
          return;
        }

        this.browserInstance = browserInstance;
        this.browserInstance.start().then(function (port) {
          deferred.resolve(port);
        });
      }.bind(this));


      return deferred.promise;
  };

  Endpoint.prototype.stop = function () {
    this.browserInstance.stop();
  };

  Endpoint.prototype.loadBrowser = function (browserName) {
      var deferred = dalek.Q.defer();
      if (!_(this.browsers).pluck('id').contains(browserName)) {
        deferred.reject(false);
        return deferred.promise;
      }

      deferred.resolve([true, (new (_.where(this.browsers, {id: browserName})[0].module)(this.options))]);
      return deferred.promise;
  };

  return Endpoint;
};
