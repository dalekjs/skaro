'use strict';
// -------------
var Config = {};
Config.CONFIG_NOT_FOUND = 1;
Config.CONFIG_NOT_READABLE = 2;
Config.CONFIG_NOT_PARSEABLE = 3;
Config.VALUE_TEMPLATE = 10;
Config.VALUE_TYPE = 11;
Config.DATA_NOT_FOUND = 21;
Config.DATA_NOT_READABLE = 22;
Config.DATA_NOT_PARSEABLE = 23;
Config.INIT_NOT_FOUND = 31;
// -------------

// node
var path = require('path');
var fs = require('fs');
// modules
var _ = require('lodash');
var Q = require('q');
var glob = require('glob');
// internals
var findFileInParents = require('../util/find-file-in-parents');
// promises
var lstat = Q.denodeify(fs.lstat);
var readfile = Q.denodeify(fs.readFile);
var globise = Q.denodeify(glob);

function ConfigFile(_path, data) {
  this._path = _path;
  this._pwd = path.dirname(_path);
  this._data = data || {};
}

ConfigFile.find = function(_path, _cwd) {
  return findFileInParents(_path, _cwd).catch(function(reason) {
    return Q.reject(reason && reason._code ? reason : {
      _message: 'Configuration file not found',
      _code: Config.CONFIG_NOT_FOUND,
      file: _path,
      error: reason,
    });
  }).then(function(_path) {
    return new ConfigFile(_path);
  });
};

ConfigFile.glob = function(patterns, _cwd) {
  if (typeof patterns === 'string') {
    patterns = [patterns];
  }

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


ConfigFile.prototype.load = function() {
  return this._read()
    .then(this._parse.bind(this))
    .then(this._loadParents.bind(this))
    .thenResolve(this);
};

ConfigFile.prototype._read = function() {
  var _path = this._path;
  return readfile(_path, {encoding: 'utf8'}).catch(function(reason) {
    return Q.reject(reason && reason._code ? reason : {
      _message: 'Configuration file is not readable',
      _code: Config.CONFIG_NOT_READABLE,
      file: _path,
      error: reason,
    });
  });
};

ConfigFile.prototype._parse = function(data) {
  var _path = this._path;
  return Q.resolve(data).then(function() {
    this._data = JSON.parse(data);
    return this._data;
  }.bind(this)).catch(function(reason) {
    return Q.reject(reason && reason._code ? reason : {
      _message: 'Configuration file is not valid JSON',
      _code: Config.CONFIG_NOT_PARSEABLE,
      file: _path,
      error: reason,
    });
  });
};

ConfigFile.prototype._loadParents = function() {
  var parents = this._data['parent.config'];
  if (!parents) {
    return Q.resolve([]);
  }

  return Q.all(parents.map(this._loadParent.bind(this))).then(function(_parents) {
    this._parents = _parents;
    return Q.all(_parents.map(function(configFile) {
      return configFile.load();
    })).thenResolve(_parents);
  }.bind(this));
};

ConfigFile.prototype._loadParent = function(_path) {
  var _resolvedPath = path.resolve(this._pwd, _path);
  return lstat(_resolvedPath)
    .thenResolve(_resolvedPath)
    .catch(function(reason) {
      return Q.reject(reason && reason._code ? reason : {
        _message: 'Configuration file not found',
        _code: Config.CONFIG_NOT_FOUND,
        file: _path,
        error: reason,
      });
    }).then(function(_path) {
      return new ConfigFile(_path);
    }.bind());
};


ConfigFile.prototype.get = function(key) {
  var value = this._data[key];
  // TODO: process templates
  return value;
};


module.exports = ConfigFile;