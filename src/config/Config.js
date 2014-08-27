'use strict';

// node
var path = require('path');
// modules
var _ = require('lodash');
var Q = require('q');
// internals
var ConfigError = require('./ConfigError.js');
var ConfigFile = require('./ConfigFile');
var processJsonFile = require('./process-json-file');


function Config(options, files) {
  this._options = options;
  this._files = files;
  this._cwd = process.cwd();
  this._configFiles = [];
}

Config.prototype.load = function() {
  return this._loadConfigFiles()
    .then(this._loadOptions.bind(this))
    .then(this._merge.bind(this))
    .then(this._loadDataFiles.bind(this))
    .then(this._verifyResources.bind(this))
    .thenResolve(this);
};

Config.prototype._loadConfigFiles = function() {
  var config = this._options.config;
  if (config === false) {
    config = [];
  }

  if (typeof config === 'string') {
    config = [config];
  }

  return Q.all(config.map(function(_path) {
    return ConfigFile.find(_path, this._cwd, this._options);
  }.bind(this))).then(function(configs) {
    this._configFiles = configs;
    // prepend dalek default config, use cwd of first config file for resources or CWD if no config given
    var cwd = configs.length ? configs[0]._pwd : process.cwd();
    this._configFiles.unshift(new ConfigFile(path.resolve(__dirname, './default-config.json'), cwd, {cli: this._options}));
    return Q.all(this._configFiles.map(function(configFile) {
      return configFile.load();
    }));
  }.bind(this));
};

Config.prototype._loadOptions = function() {
  // append cli/options config
  this.options = new ConfigFile(null, this._cwd, {cli: this._options});
  this._configFiles.push(this.options);
  this.options._resources.files = this._files;
  var data = _.clone(this._options);
  delete data.config;
  return this.options.process(data);
};

Config.prototype._merge = function() {
  var config = {};
  var resources = {};
  this._configFiles.forEach(function(_configFile) {
    _.extend(config, _configFile.data());
    var _resources = _configFile.resources();
    Object.keys(_resources).forEach(function(key) {
      if (_resources[key] && _resources[key].length || _resources[key] instanceof ConfigError) {
        resources[key] = _resources[key];
      }
    });
  });

  ['data', 'init', 'plugins', 'tests'].forEach(function(key) {
    if (this._options[key] === false) {
      resources[key] = [];
    }
  }.bind(this));

  this._config = config;
  this._resources = resources;
};

Config.prototype._loadDataFiles = function() {
  if (!this._resources.data) {
    return [];
  }

  var env = _.extend({cli: _.clone(this.options)}, {
    env: process.env,
    cwd: process.cwd(),
    path: this._pwd,
    file: this._path,
  });

  return Q.all(this._resources.data.map(function(_path) {
    return processJsonFile(_path, 'Data', env);
  })).then(function(dataMaps) {
    var data = {};
    dataMaps.forEach(function(_data) {
      _.extend(data, _data);
    });
    this._data = data;
  }.bind(this));
};

Config.prototype._verifyResources = function() {
  if (this._resources.init instanceof ConfigError) {
    return Q.reject(this._resources.init);
  }
};


Config.prototype.getOptions = function() {
  return _.clone(this._config);
};

Config.prototype.getData = function() {
  return _.clone(this._data);
};

Config.prototype.getPlugins = function() {
  return _.clone(this._resources.plugins);
};

Config.prototype.getTests = function() {
  return _.clone(this._resources.tests);
};

Config.prototype.getFiles = function() {
  if (!this._files) {
    return [];
  }

  var cwd = process.cwd();
  return this._files.map(function(_path) {
    return path.resolve(cwd, _path);
  });
};

Config.prototype.getInit = function() {
  return this._resources.init;
};


Config.prototype.getConfigFileContext = function() {
  return this._configFiles[1] && path.dirname(this._configFiles[1]._path);
};

Config.prototype.getConfigFiles = function() {
  return _.clone(this._configFiles);
};


Config.prototype.dataOrigin = function(key) {
  var found = null;
  this._configFiles.slice(1, -1).reverse().some(function(configFile) {
    return (found = configFile.dataOrigin(key));
  });
  
  return found;
};

Config.prototype.resourceOrigin = function(key) {
  var found = null;
  this._configFiles.slice(1, -1).reverse().some(function(configFile) {
    return (found = configFile.resourceOrigin(key));
  });
  
  return found;
};

module.exports = Config;
