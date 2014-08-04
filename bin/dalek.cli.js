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
}, function(reason) {
  var wrap = wordwrap(80);

  /*
    {
      message: <string>,
      code: <Config.*>,
      file: <string>,
      error: original_error,
      details: {
        name: <string>,
        value: <mixed>,
        message: <string>,
      },
    }
  */
  if (reason && reason._code) {
    console.error('\n' + chalk.bgRed.white(reason._message));
    console.error('       file: ' + chalk.magenta(reason.file));

    switch (reason._code) {
      case Config.CONFIG_NOT_FOUND:
        console.error(wrap(
          /*jshint laxbreak:true */
          '\nAre you running dalek in the correct directory?\n\n'
          + 'You can reference a configuration file from anywhere using '
          + chalk.grey('--config=path/to/Dalekfile.json') + ' or skip the config file with '
          + chalk.grey('--no-config') + '. In both cases configuration options can be overriden using '
          + chalk.grey('--option option.name=option.value') + '.'
          /*jshint laxbreak:false */
        ));
        break;

      case Config.DATA_NOT_FOUND:
        console.error(wrap(
          /*jshint laxbreak:true */
          '\nAre you running dalek in the correct directory?\n\n'
          + 'You can reference a data file from anywhere using '
          + chalk.grey('--data=path/to/data.json') + ' or skip loading any data files with '
          + chalk.grey('--no-data') + '. Note that ' + chalk.grey('--no-data') + ' files are '
          + 'resolved against CWD (' + chalk.magenta(process.cwd()) + ') whereas the config value '
          + chalk.green('data') + ' is resolved against the config file.'
          /*jshint laxbreak:false */
        ));
        break;

      case Config.CONFIG_NOT_READABLE:
      case Config.DATA_NOT_READABLE:
        var username = require('username');
        console.error('\nPlease check the permissions of this file!');
        console.error('Make sure the file can be read by the user ' + chalk.magenta(username.sync()));
        break;

      case Config.CONFIG_NOT_PARSEABLE:
      case Config.DATA_NOT_PARSEABLE:
        console.error('\nMake sure the configuration file is valid JSON!');
        console.error('Parser said: ' + chalk.magenta(reason.error.message));
        break;

      case Config.VALUE_TEMPLATE:
        console.error('     option: ' + chalk.magenta(reason.details.name));
        console.error('      value: ' + chalk.magenta(reason.details.value));
        console.error('Parser said: ' + chalk.magenta(reason.details.message));
        break;

      case Config.VALUE_TYPE:
        console.error('     option: ' + chalk.magenta(reason.details.name));
        console.error('      value: ' + chalk.magenta(reason.details.value));
        console.error('   expected: ' + chalk.magenta('array'));
        break;

      default:
        console.error('LOADING THE CONFIGURATION FAILED UNEXPECTEDLY!');
        console.error(reason);
        break;
    }
  } else {
    console.error('LOADING THE CONFIGURATION FAILED UNEXPECTEDLY!');
    console.error(reason.stack);
  }

  process.exit(1);
}).done();
