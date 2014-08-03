'use strict';

var path = require('path');
var fs = require('fs');

var _ = require('lodash');
var Q = require('q');
var glob = require('glob');

var defaultConfig = require('../default-config.json');
var findFileInParents = require('../util/find-file-in-parents');

var readfile = Q.denodeify(fs.readFile);

// matches ${foo} and ${foo:-bar}
var variablePattern = /\$\{env\.([^\}]+?)(:-([^\}]+))?\}/g;

function Config(cli, files, cwd) {
  this._base = cwd;
  this._cwd = cwd;
  this._cli = cli;
  this._files = files;

  this._configfile = null;
  this._config = _.clone(defaultConfig);
}

Config.CONFIG_NOT_FOUND = 1;
Config.CONFIG_NOT_READABLE = 2;
Config.CONFIG_NOT_PARSEABLE = 3;

Config.prototype.load = function() {
  var initialize = function() {
    this.importCli();
    this.parse();
    this.verify();
  }.bind(this);

  return this.importConfig()
    .then(initialize)
    .thenResolve(this);
};

Config.prototype.importConfig = function() {
  if (!this._cli.config) {
    return Q.resolve();
  }

  var config = this;

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

Config.prototype.parse = function() {
  this.parseVariables();

  // find plugins to load, unless disabled by CLI
  if (this._config.plugins) {
    // if supplied by CLI, use CWD for resolving relative paths,
    // otherwise use the config file's directory
    this._plugins = glob.sync(this._config.plugins, {
      cwd: this._cli.plugins ? this._base : path.dirname(this._configfile),
      silent: true,
      strict: true,
    });
  }

  // find test suites to load, unless disabled by CLI
  if (this._config.tests) {
    // if supplied by CLI, use CWD for resolving relative paths,
    // otherwise use the config file's directory
    this._tests = glob.sync(this._config.tests, {
      cwd: this._cli.tests ? this._base : path.dirname(this._configfile),
      silent: true,
      strict: true,
    });
  }
};

Config.prototype.parseVariables = function() {
  Object.keys(this._config).forEach(function(key) {
    var value = this._config[key];
    if (typeof value !== 'string') {
      return;
    }

    // TODO: replace variable syntax with that of grunt
    // replacing "${env.HOME}" with "/Users/myuser" 
    this._config[key] = this._config[key].replace(variablePattern, function(match, name, defaultGroup, defaultValue) {
      return process.env[name] || defaultValue || '';
    });

  }.bind(this));
};

Config.prototype.verify = function() {
  // TODO: verify configuration integrity
};



Config.prototype.toJSON = function() {
  return _.clone(this._config);
};




module.exports = Config;