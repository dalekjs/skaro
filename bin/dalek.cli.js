#!/usr/bin/env node
'use strict';

// https://github.com/harthur/nomnom

var cliOptions = require('./dalek.cli.options.js')();

if (cliOptions.version) {
  require('./dalek.cli.version')();
  return;
}

if (!cliOptions._command) {
  console.log('no command specified');
  // TODO: output `dalek --help`
  return;
}

var Config = require('../src/core/Config');
var config = new Config(cliOptions, process.cwd());
config.verify();

var Dalek = require('../index.js');
var dalek = new Dalek(config);

// TODO: move the domain thing to dalek!
var domain = require('domain').create();
domain.on('error', function(error) {
  dalek.reporter.error(error);
});
domain.run(function() {
  // TODO: glob() from dalek.options('test');
  require('../example/tests/Dummy')(dalek);

  // TODO: start and stop a test run properly
  dalek.run().then(function() {
    console.log('\nEXTERMINATED');
  }, function(/*failedSuiteHandle*/) {
    console.log('\nDALEK FAILED');
  });
});
