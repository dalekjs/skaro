module.exports = function() {
  'use strict';

  var nomnom = require('nomnom').script('dalek');

  var command;
  var options = {
    global: {
      // configuration file and options
      config: {
        abbr: 'c',
        metavar: 'FILE',
        // TODO: windows compatible path
        default: 'Dalekfile.json',
        help: 'path to configuration file (disable with --no-config)'
      },
      option: {
        abbr: 'o',
        type: 'string',
        list: true,
        metavar: 'name=val',
        help: 'config option(s) to set'
      },

      // console output
      debug: {
        flag: true,
        help: 'engange debug mode'
      },
      silent: {
        flag: true,
        help: 'suppress all output'
      },
      noColors: {
        full: 'no-colors',
        flag: true,
        help: 'disable colorized output in the console'
      },
      noSymbols: {
        full: 'no-symbols',
        flag: true,
        help: 'disable UTF-8 symbols in the console'
      },
    },
    nocommand: {
      version: {
        abbr: 'v',
        flag: true,
        help: 'print version and exit'
      },
    },
    run: {
      // resources
      plugin: {
        type: 'string',
        list: true,
        help: 'plugin file(s) to load'
      },
      test: {
        type: 'string',
        list: true,
        help: 'test file(s) to load'
      },
      ignore: {
        type: 'string',
        list: true,
        help: 'test file(s) not to load'
      },

      // affecting browsers
      browser: {
        abbr: 'b',
        type: 'string',
        list: true,
        help: 'Browser(s) you would like to invoke'
      },
      viewport: {
        type: 'string',
        help: 'dimensions of the browser viewport at startup (shorthand for -o viewport=<val>)'
      },

      // affecting reporting
      reporter: {
        abbr: 'r',
        type: 'string',
        list: true,
        help: 'Reporter(s) to spin up for logging test results',
        choices: ['console', 'html', 'json', 'junit']
      },
    },
    remote: {
      'remote.port': {
        full: 'port',
        default: 9020,
        help: 'port to bind to'
      },
      'remote.interface': {
        full: 'interface',
        type: 'text',
        default: 'localhost',
        help: 'network interface to bind to'
      }
    },
  };

  // global options
  nomnom.options(options.global);

  nomnom.nocommand().options(options.nocommand)
    .help('Usage: dalek <command>\n\nSee the docs for the CLI at http://dalekjs.com/docs/cli.html');

  nomnom.command('run').options(options.run)
    .help('Execute Test Suite')
    .callback(function() {
      command = 'run';
    });

  nomnom.command('verify').options(options.run)
    .help('Verfiy Suite, Unit, Task integrity')
    .callback(function() {
      command = 'verify';
      // TODO: implement facility that loads all suites, units, tasks and verifies
      // that all interfaces are available. This is supposed to give quick feedback
      // about a missing / malformed plugin, that would otherwise only be thrown
      // at execution time
      console.log('NOT IMPLEMENTED YET');
      process.exit(1);
    });

  nomnom.command('remote').options(options.remote)
    .help('Start Dalek as a remote proxy')
    .callback(function() {
      command = 'remote';
      console.log('NOT IMPLEMENTED YET');
      process.exit(1);
    });

  nomnom.command('integrity')
    .help('Verfiy Dalek installation integrity')
    .callback(function() {
      command = 'integrity';
      // TODO: implement facility that detects installed browser drivers,
      // initializes them and verifies their status.
      console.log('NOT IMPLEMENTED YET');
      process.exit(1);
    });

  var opts = nomnom.parse();
  opts._command = command;
  return opts;
};
