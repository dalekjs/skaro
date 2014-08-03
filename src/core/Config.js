'use strict';

var _ = require('lodash');

// matches ${foo} and ${foo:-bar}
var variablePattern = /\$\{env\.([^\}]+?)(:-([^\}]+))?\}/g;

function Config(cli, files, cwd) {
  this._cwd = cwd;
  this._cli = cli;
  this._files = files;
  this._config = {};
  
  this.importConfig();
  this.importCli();
  this.parse();
}

Config.prototype.importConfig = function() {
  if (this._cli.config === false) {
    return;
  }

  // TODO: load configuration file
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
  Object.keys(this._config).forEach(function(key) {
    var value = this._config[key];
    if (typeof value !== 'string') {
      return;
    }

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