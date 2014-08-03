#!/usr/bin/env node --harmony
'use strict';

var chalk = require('chalk');
var wordwrap = require('wordwrap');
var cli = require('./dalek.cli.options.js')();

if (cli.options.version) {
  require('./dalek.cli.version')();
  return;
}

if (!cli.command) {
  cli.error('No command specified');
  return;
}

var Config = require('../src/core/Config');
var config = new Config(cli.options, cli.files, process.cwd());
config.load().then(function(config) {
  require('./commands/command.' + cli.command)(config, cli);
}).catch(function(reason) {
  var wrap = wordwrap(80);

  switch (reason.code) {
    case Config.CONFIG_NOT_FOUND:
      cli.error(
        'Configuration file (' + cli.options.config + ') not found', wrap(
          /*jshint laxbreak:true */
          'Are you running dalek in the correct directory?\n\n'
          + 'You can reference a configuration file from anywhere using '
          + chalk.blue('--config=path/to/Dalekfile.json') + ' or skip the config file with '
          + chalk.blue('--no-config') + '. In both cases configuration options can be provided using '
          + chalk.blue('--option option.name=option.value') + '.'
          /*jshint laxbreak:false */
      ));
      break;

    case Config.CONFIG_NOT_READABLE:
      var username = require('username');
      cli.error(
        'Configuration file (' + chalk.magenta(cli.options.config) + ') could not be read', wrap(
          /*jshint laxbreak:true */
          'Please check the permissions of this file!\n'
          + 'Make sure the file can be read by the user '
          + chalk.blue(username.sync())
          // TODO: identify user:group the node process is running in
          /*jshint laxbreak:false */
      ));
      break;

    case Config.CONFIG_NOT_PARSEABLE:
      cli.error(
        'Configuration file (' + chalk.magenta(cli.options.config) + ') could not be parsed', wrap(
          /*jshint laxbreak:true */
          'Make sure the configuration file is valid JSON!\nParser said: '
          + reason.original.message
          /*jshint laxbreak:false */
      ));
      break;

      case Config.VALUE_TEMPLATE:
        cli.error(
          'Malformed configuration value could not be processed', wrap(
            /*jshint laxbreak:true */
            'value: ' + chalk.magenta(reason.message) +
            '\n Parser said: ' + reason.original.message
            /*jshint laxbreak:false */
        ));
        break;

      // TODO: error output for data files

    default:
      console.error('LOADING THE CONFIGURATION FAILED UNEXPECTEDLY!');
      console.error(reason.stack);
  }

}).done();
