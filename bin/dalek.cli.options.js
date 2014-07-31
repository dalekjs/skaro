module.exports = function() {
  'use strict';

  var nomnom = require('nomnom').script('dalek');

  // global options
  nomnom.options({
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
  });

  // local options
  nomnom.nocommand().options({
    version: {
      abbr: 'v',
      flag: true,
      help: 'print version and exit'
    },

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
  }).help('See the docs for the CLI at http://dalekjs.com/docs/cli.html');

  // remote-proxy options
  nomnom.command('remote').options({
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
  }).help('Start Dalek as a remote proxy').callback(function() {
    console.log('NOT IMPLEMENTED YET');
    process.exit(1);
  });

  nomnom.command('verify')
    .help('Verfiy Dalek installation integrity').callback(function() {
      // TODO: implement facility that detects installed browser drivers,
      // initializes them and verifies their status.
      console.log('NOT IMPLEMENTED YET');
      process.exit(1);
    });
  return nomnom.parse();
};
