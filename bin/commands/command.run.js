module.exports = function(config/*, cli*/) {
  'use strict';

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
};