'use strict';

var path = require('path');
var fs = require('fs');

var _ = require('lodash');
var Q = require('q');
var glob = require('glob');

var defaultConfig = require('../default-config.json');
var findFileInParents = require('../util/find-file-in-parents');

var lstat = Q.denodeify(fs.lstat);
var readfile = Q.denodeify(fs.readFile);

function Config(cli, files, cwd) {
  this._base = cwd;
  this._cwd = cwd;
  this._cli = cli;
  this._files = files;

  this._configfile = null;
  this._config = _.clone(defaultConfig);
  this._data = {};
}

Config.CONFIG_NOT_FOUND = 1;
Config.CONFIG_NOT_READABLE = 2;
Config.CONFIG_NOT_PARSEABLE = 3;
Config.VALUE_TEMPLATE = 10;
Config.VALUE_ARRAY = 11;
Config.DATA_NOT_FOUND = 21;
Config.DATA_NOT_READABLE = 22;
Config.DATA_NOT_PARSEABLE = 23;

Config.prototype.load = function() {

  return this.importConfig()
    .then(this.importCli.bind(this))
    .then(this.parse.bind(this))
    .then(this.importData.bind(this))
    .then(this.verify.bind(this))
    .thenResolve(this);
};

Config.prototype.cwdForOption = function(option) {
  return this._cli[option] ? this._base : path.dirname(this._configfile)
};

Config.prototype.importConfig = function() {
  if (!this._cli.config) {
    return Q.resolve();
  }

  var config = this;

  function readConfigFile(_path) {
    config._configfile = _path;
    return readfile(_path, {encoding: 'utf8'});
  }

  function parseConfigJson(data) {
    var _data = JSON.parse(data);
    config._config = _data;
    return _data;
  }

  return findFileInParents(this._cli.config, this.cwd)
    .catch(rejectWith('File Not Found', Config.CONFIG_NOT_FOUND))
    .then(readConfigFile)
    .catch(rejectWith('File Not Readable', Config.CONFIG_NOT_READABLE))
    .then(parseConfigJson)
    .catch(rejectWith('File Not JSON', Config.CONFIG_NOT_PARSEABLE));
};

Config.prototype.importCli = function() {
  var options = {};
  var cli = _.clone(this._cli);
  // --option foo=bar has higher precedence as --foo=bar
  if (cli.option) {
    cli.option.forEach(function(token) {
      var tokens = token.split('=');
      options[tokens[0]] = tokens.slice(1).join('=');
    });
    delete cli.option;
  }

  _.extend(this._config, cli);
  _.extend(this._config, options);
};

Config.prototype.importData = function() {
  if (this._cli.data === false || !this._config.data || !this._config.data.length) {
    return Q.resolve();
  }

  if (!Array.isArray(this._config.data)) {
    var _error = new Error('data');
    _error.code = Config.VALUE_ARRAY;
    return Q.reject(_error);
  }

  var config = this;
  return Q.all(this._config.data.map(this.importDataFile.bind(this))).then(function(_data) {
    // preserve the order in which data files were specified
    _data.forEach(function(data) {
      _.extend(config._data, data);
    });
  });
};

Config.prototype.importDataFile = function(_path) {
  function readDataFile(_path) {
    return readfile(_path, {encoding: 'utf8'});
  }

  function parseDataJson(data) {
    var _data = JSON.parse(data);
    return _data;
  }
  console.log(this.cwdForOption('data'), _path)
  return lstat(path.resolve(this.cwdForOption('data'), _path))
    .thenResolve(_path)
    .catch(rejectWith(path, Config.DATA_NOT_FOUND))
    .then(readDataFile)
    .catch(rejectWith(path, Config.DATA_NOT_READABLE))
    .then(parseDataJson)
    .catch(rejectWith(path, Config.DATA_NOT_PARSEABLE));
};


Config.prototype.parse = function() {
  this.parseTemplates(this._config);

  // find plugins to load, unless disabled by CLI
  if (this._config.plugins) {
    // if supplied by CLI, use CWD for resolving relative paths,
    // otherwise use the config file's directory
    this._plugins = glob.sync(this._config.plugins, {
      cwd: this.cwdForOption('plugins'),
      silent: true,
      strict: true,
    });
  }

  // find test suites to load, unless disabled by CLI
  if (this._config.tests) {
    // if supplied by CLI, use CWD for resolving relative paths,
    // otherwise use the config file's directory
    this._tests = glob.sync(this._config.tests, {
      cwd: this.cwdForOption('tests'),
      silent: true,
      strict: true,
    });
  }
};

Config.prototype.parseTemplates = function(data) {
  var _array = Array.isArray(data);
  var list = _array ? data : Object.keys(data);
  var templateData = {
    env: process.env,
    cwd: this._cwd,
    cli: this._cli,
    // if we need access to package.json, we'll have to findFileInParents('package.json')
    // pkg: this._packageJson,
  };

  list.forEach(function(key, index) {
    if (_array) {
      // access item in original list
      key = index;
    }

    // dive into nested structures
    if (typeof data[key] === 'object' || Array.isArray(data[key])) {
      this.parseTemplates(data[key]);
      return;
    }
    // only strings can contain variables
    if (typeof data[key] !== 'string') {
      return;
    }

    try {
      data[key] = _.template(data[key], templateData);
    } catch (_error) {
      var error = new Error(data[key]);
      error.code = Config.VALUE_TEMPLATE;
      error.original = _error;
      throw error;
    }
  }.bind(this));
};


Config.prototype.verify = function() {
  // TODO: verify configuration integrity
};



// TODO: replace this with proper accessors
Config.prototype.toJSON = function() {
  return _.clone(this._config);
};


function rejectWith(message, code) {
  return function(_error) {
    if (_error.code) {
      return Q.reject(_error);
    }

    var error = new Error(message);
    error.code = code;
    error.original = _error;
    return Q.reject(error);
  };
}

module.exports = Config;