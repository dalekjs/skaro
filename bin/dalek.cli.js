#!/usr/bin/env node --harmony
'use strict';

// https://github.com/harthur/nomnom

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

chalk = require('chalk')