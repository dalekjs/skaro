'use strict';

// node
var path = require('path');
// modules
var _ = require('lodash');
var Q = require('q');
var glob = require('glob');
// internals
var ConfigError = require('./ConfigError.js');
var findFileInParents = require('../util/find-file-in-parents');
var fileExists = require('./file-exists');
var processJsonFile = require('./process-json-file');
// promises
var globise = Q.denodeify(glob);

function ConfigFile(_path, cwd, env) {
  // fully qualified path to configuration file
  this._path = _path;
  // directory of the configuration file used for resolving resource files
  this._pwd = cwd || path.dirname(_path);
  // data loaded from the file
  this._data = {};
  // used for processing variable templates
  this._env = _.extend(_.clone(env || {}), {
    env: process.env,
    cwd: process.cwd(),
    path: this._pwd,
    file: this._path,
  });
  // list of parent configuration files
  this._parents = [];
  // identified resource files
  this._resources = {
    init: null,
    files: null,
    tests: null,
    plugins: null,
    data: null,
  };
}

ConfigFile.find = function(_path, _cwd, env) {
  return findFileInParents(_path, _cwd)
    .catch(ConfigError.decorateCatch('Configuration', ConfigError.NOT_FOUND, _path))
    .then(function(_path) {
      return new ConfigFile(_path, null, env);
    });
};

ConfigFile.glob = function(patterns, _cwd) {
  return globise(patterns, {
    cwd: _cwd,
    root: '/',
    silent: true,
    strict: true,
  }).then(function(matches) {
    // glob returns relative paths, make them absolute
    return matches.map(function(_path) {
      return path.resolve(_cwd, _path);
    });
  });
};

ConfigFile.prototype.glob = function(patterns) {
  return ConfigFile.glob(patterns, this._pwd);
};

ConfigFile.prototype.load = function() {
  return processJsonFile(this._path, 'Configuration', this._env)
    .then(this._identifyParents.bind(this))
    .then(this._loadParents.bind(this))
    .then(this._identifyDataFiles.bind(this))
    .then(this._identifyResources.bind(this))
    .catch(ConfigError.catchFileStack(this._path))
    .thenResolve(this);
};

ConfigFile.prototype.process = function(data) {
  this._data = data;
  return Q.resolve(this)
    .then(this._loadParents.bind(this))
    .then(this._identifyDataFiles.bind(this))
    .then(this._identifyResources.bind(this))
    .catch(ConfigError.catchFileStack(this._path))
    .thenResolve(this);
};


ConfigFile.prototype._identifyParents = function(data) {
  this._data = data;
  var parents = this._data['parent.config'];
  delete this._data['parent.config'];
  if (!parents) {
    return [];
  }

  return Q.all(parents.map(this._identifyParent.bind(this))).then(function(_parents) {
    this._parents = _parents;
    return _parents;
  }.bind(this));
};

ConfigFile.prototype._identifyParent = function(_path) {
  var _resolvedPath = path.resolve(this._pwd, _path);
  var env = this._env;
  
  return fileExists(_resolvedPath, 'Configuration')
    .then(function(_path) {
      return new ConfigFile(_path, null, env);
    });
};

ConfigFile.prototype._loadParents = function() {
  return Q.all(this._parents.map(function(configFile) {
    return configFile.load();
  })).thenResolve(this._parents);
};

ConfigFile.prototype._identifyResources = function() {
  return Q.all([
    !this._data.plugins ? null : this.glob(this._data.plugins),
    !this._data.tests ? null : this.glob(this._data.tests),
    !this._data.init ? null : this.glob(this._data.init),
  ]).spread(function(plugins, tests, init) {
    this._resources.plugins = plugins;
    this._resources.tests = tests;
    this._resources.init = init && init[0] || null;

    if (!this._resources.init && this._data.init) {
      // existance check has to be performed in Config,
      // because various init declarations may be encountered
      // but only the last one is the valid import
      this._resources.init = new ConfigError('Init', ConfigError.NOT_FOUND, this._data.init);
    }

    delete this._data.init;
    delete this._data.tests;
    delete this._data.plugins;
  }.bind(this)).thenResolve(this);
};

ConfigFile.prototype._identifyDataFiles = function() {
  var _data = this._data.data;

  if (_data && !Array.isArray(_data)) {
    return Q.reject(new ConfigError('Configuration', ConfigError.VALUE_TYPE, this._path, {
      name: 'data',
      value: this._data.data,
      expected: 'array',
    }));
  }

  if (!_data || !_data.length) {
    return null;
  }

  delete this._data.data;
  this._resources.data = _data.map(function(_path) {
    return path.resolve(this._pwd, _path);
  }.bind(this));

  return null;
};


ConfigFile.prototype.data = function() {
  var data = _.extend({}, this._data);

  this._parents.forEach(function(parent) {
    var _data = parent.data();
    Object.keys(_data).forEach(function(key) {
      if (data[key] === undefined) {
        data[key] = _data[key];
      }
    });
  });

  return data;
};

ConfigFile.prototype.resources = function() {
  var data = _.extend({}, this._resources);
  this._parents.forEach(function(parent) {
    var _data = parent.resources();
    Object.keys(_data).forEach(function(key) {
      if (data[key] === null) {
        data[key] = _data[key];
      }
    });
  });

  return data;
};

ConfigFile.prototype.dataOrigin = function(key) {
  if (this._data[key] !== undefined) {
    return this;
  }

  var found = null;
  this._parents.reverse().some(function(parent) {
    return (found = parent.dataOrigin(key));
  });

  return found;
};

ConfigFile.prototype.resourceOrigin = function(key) {
  if (this._resources[key] && this._resources[key].length) {
    return this;
  }

  var found = null;
  this._parents.reverse().some(function(parent) {
    return (found = parent.resourceOrigin(key));
  });

  return found;
};

module.exports = ConfigFile;