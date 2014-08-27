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

var ConfigError = require('../src/config/ConfigError.js');
var Config = require('../src/config/Config');
var config = new Config(cli.options, cli.files);
config.load().then(function(config) {
  return require('./commands/command.' + cli.command)(config);
}, function(reason) {
  var wrap = wordwrap(80);

  /*
    reason = {
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

  if (reason instanceof ConfigError) {
    console.error('\n' + chalk.bgRed.white(reason.message));
    console.error('       file: ' + chalk.magenta(reason.path));

    switch (reason.code) {
      case ConfigError.NOT_FOUND:
        switch (reason.type) {
          case 'Configuration':
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

          case 'Data':
            console.error(wrap(
              /*jshint laxbreak:true */
              '\nAre you running dalek in the correct directory?\n\n'
              + 'You can reference a data file from anywhere using '
              + chalk.grey('--data=path/to/data.json') + ' or skip loading any data files with '
              + chalk.grey('--no-data') + '. Note that ' + chalk.grey('--data') + ' files are '
              + 'resolved against CWD (' + chalk.magenta(process.cwd()) + ') whereas the config value '
              + chalk.green('data') + ' is resolved against the config file.'
              /*jshint laxbreak:false */
            ));
            break;

          case 'Init':
            console.error(wrap(
              /*jshint laxbreak:true */
              '\nAre you running dalek in the correct directory?\n\n'
              + 'You can reference an init file from anywhere using '
              + chalk.grey('--init=path/to/init.js') + ' or prevent loading an init file with '
              + chalk.grey('--no-init') + '. Note that with ' + chalk.grey('--init') + ' the path is '
              + 'resolved against CWD (' + chalk.magenta(process.cwd()) + ') whereas the config value '
              + chalk.green('data') + ' is resolved against the config file.'
              /*jshint laxbreak:false */
            ));
            break;
        }
        break;

      case ConfigError.NOT_READABLE:
        var username = require('username');
        console.error('\nPlease check the permissions of this ' + reason.type + ' file!');
        console.error('Make sure the file can be read by the user ' + chalk.magenta(username.sync()));
        break;

      case ConfigError.NOT_PARSEABLE:
        console.error('\nMake sure the ' + reason.type + ' file is valid JSON!');
        console.error('Parser said: ' + chalk.magenta(reason.original.message));
        break;

      case ConfigError.VALUE_TEMPLATE:
        console.error('     option: ' + chalk.magenta(reason.original.name));
        console.error('      value: ' + chalk.magenta(reason.original.value));
        console.error('Parser said: ' + chalk.magenta(reason.original.message));
        break;

      case ConfigError.VALUE_TYPE:
        console.error('     option: ' + chalk.magenta(reason.original.name));
        console.error('      value: ' + chalk.magenta(reason.original.value));
        console.error('   expected: ' + chalk.magenta('array'));
        break;

      default:
        console.error('LOADING THE CONFIGURATION FAILED UNEXPECTEDLY!');
        console.error(reason.stack || reason);
        console.error(reason.original && reason.original.stack);
        break;
    }
  } else {
    console.error('LOADING THE CONFIGURATION FAILED UNEXPECTEDLY!');
    console.error(reason.stack || reason);
  }

  process.exit(1);
}).done();
