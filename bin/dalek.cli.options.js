module.exports = function() {
  'use strict';

  var chalk = require('chalk');
  var nomnom = require('nomnom').script('dalek');

  var command;
  var optionKey;
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
    .help('Usage: dalek <command>\n\nSee the docs for the CLI at http://dalekjs.com/docs/cli.html')
    .callback(function() {
      optionKey = 'nocommand';
    });

  nomnom.command('run').options(options.run)
    .help('Execute Test Suite')
    .callback(function() {
      optionKey = 'run';
      command = 'run';
    });

  nomnom.command('verify').options(options.run)
    .help('Verfiy Suite, Unit, Task integrity')
    .callback(function() {
      optionKey = 'run';
      command = 'verify';
    });

  nomnom.command('remote').options(options.remote)
    .help('Start Dalek as a remote proxy')
    .callback(function() {
      optionKey = 'remote';
      command = 'remote';
    });

  nomnom.command('integrity')
    .help('Verfiy Dalek installation integrity')
    .callback(function() {
      optionKey = '';
      command = 'integrity';
    });

  var opts = nomnom.parse();

  // verify input to disallow options we don't know
  // extract opts[0…] to _indexed
  // extract opts._ to _files
  var _commandOptions = options[optionKey] || {};
  var _indexed = {};
  var _files = opts._.slice(1);
  delete opts._;
  Object.keys(opts).forEach(function(key) {
    if (key.match(/^(\d+)$/)) {
      _indexed[key] = opts[key];
      delete opts[key];
      return;
    }

    if (!_commandOptions[key] && !options.global[key]) {
      nomnom.print(chalk.bgRed.white('unknown option:') + ' ' + chalk.bgBlack.red('-' + key) + '\n\n' + nomnom.getUsage(), 1);
    }
  });

  return {
    options: opts,
    command: command,
    files: _files,
    indexed: _indexed,
    error: function(message, suggestion) {
      if (suggestion) {
        suggestion += '\n\n';
      } else {
        suggestion = '';
      }

      nomnom.print(chalk.bgRed.white(message) + '\n\n' + suggestion + nomnom.getUsage(), 1);
    }
  };
};
