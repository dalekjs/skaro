#!/usr/bin/env node --harmony
'use strict';

var chalk = require('chalk');
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

  if (reason === Config.FILE_NOT_FOUND) {
    cli.error(
      'Configuration file (' + cli.options.config + ') not found',
      'Are you running dalek in the correct directory?\n'
      + 'You can reference a configuration file from anywhere using '
      + chalk.blue('--config=path/to/Dalekfile.json') + ' or skip the config file with '
      + chalk.blue('--no-config') + '. In both cases configuration options can be provided using '
      + chalk.blue('--option option.name=option.value') + '.'
    );
    return;
  }

}).done();
