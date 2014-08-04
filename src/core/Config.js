'use strict';

var path = require('path');
var fs = require('fs');

var _ = require('lodash');
var Q = require('q');
var glob = require('glob');

var defaultConfig = require('../default-config.json');
var findFileInParents = require('../util/find-file-in-parents');

var globise = Q.denodeify(glob);
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
  this._plugins = [];
  this._tests = [];
}

Config.CONFIG_NOT_FOUND = 1;
Config.CONFIG_NOT_READABLE = 2;
Config.CONFIG_NOT_PARSEABLE = 3;
Config.VALUE_TEMPLATE = 10;
Config.VALUE_TYPE = 11;
Config.DATA_NOT_FOUND = 21;
Config.DATA_NOT_READABLE = 22;
Config.DATA_NOT_PARSEABLE = 23;

Config.prototype.load = function() {
  return this.importConfig()
    .then(this.importCli.bind(this))
    .then(this.parseConfig.bind(this))
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
    .catch(function(reason) {
      return Q.reject(reason && reason._code ? reason : {
        _message: 'Configuration file not found',
        _code: Config.CONFIG_NOT_FOUND,
        file: config._cli.config,
        error: reason,
      });
    })
    .then(readConfigFile)
    .catch(function(reason) {
      return Q.reject(reason && reason._code ? reason : {
        _message: 'Configuration file is not readable',
        _code: Config.CONFIG_NOT_READABLE,
        file: config._configfile,
        error: reason,
      });
    })
    .then(parseConfigJson)
    .catch(function(reason) {
      return Q.reject(reason && reason._code ? reason : {
        _message: 'Configuration file is not valid JSON',
        _code: Config.CONFIG_NOT_PARSEABLE,
        file: config._configfile,
        error: reason,
      });
    })
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
    return Q.reject({
      _message: 'Wrong data type encountered',
      _code: Config.VALUE_TYPE,
      file: config._cli.config,
      details: {
        name: 'data',
        value: this._config.data,
        expected: 'array',
      },
    });
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

  return lstat(path.resolve(this.cwdForOption('data'), _path))
    .thenResolve(_path)
    .catch(function(reason) {
      return Q.reject(reason && reason._code ? reason : {
        _message: 'Data file not found',
        _code: Config.DATA_NOT_FOUND,
        file: _path,
        error: reason,
      });
    })
    .then(readDataFile)
    .catch(function(reason) {
      return Q.reject(reason && reason._code ? reason : {
        _message: 'Data file is not readable',
        _code: Config.DATA_NOT_READABLE,
        file: _path,
        error: reason,
      });
    })
    .then(parseDataJson)
    .catch(function(reason) {
      return Q.reject(reason && reason._code ? reason : {
        _message: 'Data file is not valid JSON',
        _code: Config.DATA_NOT_PARSEABLE,
        file: _path,
        error: reason,
      });
    });
};

Config.prototype.glob = function(patterns, cwd) {
  return globise(patterns, {
    cwd: cwd,
    root: '/',
    silent: true,
    strict: true,
  }).then(function(matches) {
    return matches.map(function(_path) {
      return path.resolve(cwd, _path);
    });
  });
};

Config.prototype.parseConfig = function() {
  // find plugins and tests to load, unless disabled by CLI.
  // if option was supplied by CLI, use CWD for resolving relative paths,
  // otherwise use the config file's directory
  var globs = Q.all([
    !this._config.plugins ? [] : this.glob(this._config.plugins, this.cwdForOption('plugins')),
    !this._config.tests ? [] : this.glob(this._config.tests, this.cwdForOption('tests'))
  ]).spread(function(plugins, tests) {
    this._plugins = plugins;
    this._tests = tests;
  }.bind(this));

  // make use of the time the globs are not blocking :)
  this.parseTemplates(this._config, this._configfile);

  return globs;
};

Config.prototype.parseTemplates = function(data, _path) {
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
      this.parseTemplates(data[key], _path);
      return;
    }
    // only strings can contain variables
    if (typeof data[key] !== 'string') {
      return;
    }

    try {
      data[key] = _.template(data[key], templateData);
    } catch (reason) {
      throw {
        _message: 'Malformed value template',
        _code: Config.VALUE_TEMPLATE,
        file: _path,
        error: reason,
        details: {
          name: key,
          value: data[key],
          message: reason.message,
        },
      };
    }
  }.bind(this));
};

Config.prototype.verify = function() {
  // TODO: verify configuration integrity
};


Config.prototype.getOptions = function() {
  return _.clone(this._config);
};

Config.prototype.getData = function() {
  return _.clone(this._data);
};

Config.prototype.getPlugins = function() {
  return _.clone(this._plugins);
};

Config.prototype.getTests = function() {
  return _.clone(this._tests);
};

Config.prototype.getFiles = function() {
  return this._files.map(function(_path) {
    return path.resolve(this._cwd, _path);
  }.bind(this));
};

module.exports = Config;