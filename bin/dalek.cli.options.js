module.exports = function() {
  'use strict';

  // TODO: find a wordwrap alternative that can deal with chalk (escape sequence) flavored text
  var chalk = require('chalk');
  var wordwrap = require('wordwrap');
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
      warnings: {
        full: 'no-warnings',
        flag: true,
        help: 'suppress all warning'
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
      bare: {
        flag: true,
        help: 'shorthand for --no-config --no-data --no-init --no-plugins --no-tests'
      },
      init: {
        type: 'string',
        help: 'load and execute before loading any user plugins and tests'
      },
      tests: {
        type: 'string',
        help: 'glob pattern to find test suites (see note on loading files)'
      },
      plugins: {
        type: 'string',
        help: 'glob pattern to find plugins (see note on loading files)'
      },
      data: {
        type: 'string',
        list: true,
        help: 'JSON data file(s) to provide to tests'
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

  function getExtendedUsage(command) {
    switch (command.name) {
      case 'run':
      case 'verify':
        var wrap = wordwrap(80);
        // TODO: this should probably be put in a man page or something
        return wrap(
          /*jshint laxbreak:true */
          chalk.blue('Loading Files:') + '\n'
          + 'By default Dalek will identify test suites using the glob pattern specified in the config value '
          + chalk.green('tests') + ' (internal default: ' + chalk.magenta('tests/**/*.js') + ') resolved relative '
          + 'to the directory of the configuration file (' + chalk.magenta('Dalekfile.json') + ', change with CLI option '
          + chalk.grey('--config') +'). Should you specify a glob pattern with the CLI option ' + chalk.grey('--tests') + ', '
          + 'the pattern will be resolved relative to the current working directory (CWD: ' + chalk.magenta(process.cwd()) + '). '
          + 'You can disable loading files with the CLI option ' + chalk.grey('--no-tests') + '.'
          + '\n\n'
          + 'The same rules apply to the CLI option ' + chalk.grey('--plugins') + ', ' + chalk.grey('--no-plugins')  + ' '
          + 'and the config value ' + chalk.green('plugins') + ' (internal default: ' + chalk.magenta('plugins/**/*.js') + ').'
          + '\n\n'
          + 'The same rules apply to the CLI option ' + chalk.grey('--data') + ', ' + chalk.grey('--no-data')  + ' '
          + 'and the config value ' + chalk.green('data') + ' (internal default: ' + chalk.magenta('null') + ').'
          + '\n\n'
          + 'The same rules apply to the CLI option ' + chalk.grey('--init') + ', ' + chalk.grey('--no-init')  + ' '
          + 'and the config value ' + chalk.green('init') + ' (internal default: ' + chalk.magenta('null') + ').'
          + '\n\n'
          + 'Any CLI options not attributed to an option are considered files to load independently of '
          + chalk.grey('--tests') + ' and ' + chalk.grey('--plugins') + '. To load specific test files: '
          + chalk.grey('dalek run --no-tests my-test-*.js') + '\n\n'
          + 'To run only the files specified as CLI arguments use ' + chalk.grey('--bare') + ' as a shorthand for '
          + chalk.grey('--no-config --no-data --no-init --no-plugins --no-tests')
          /*jshint laxbreak:false */
        );

      default:
        return '';
    }
  }

  // duckpunch nomnom's getUsage so we can add a bit more helpful stuff to the end
  nomnom.getUsage = (function(getUsage) {
    return function() {
      var usage = getUsage.apply(this, arguments);

      // command is an object if, and only if, we're in a command.
      // it is a function if we're in nocommand.
      var _extended = getExtendedUsage(typeof this.command !== 'function' ? this.command : this.fallback);
      if (_extended) {
        usage += '\n\n' + _extended;
      }

      return usage;
    };
  })(nomnom.getUsage);

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

  // expand shorthands
  if (opts.bare) {
    // --bare shorthand for --no-config --no-data --no-init --no-plugins --no-tests
    opts.config = opts.data = opts.init = opts.plugins = opts.tests = false;
  }

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
