'use strict';

var _ = require('lodash');
var Driver = require('dalek-driver-phantomjs');
var dalekContext = require('./dalek-context.js')();
var WD = require('../../src/core/wd.js');


function throwOnError(error) {
  throw new Error(error);
}

function startDriver(callback) {
  var driver = new Driver();
  var wd;

  var stop = function(callback) {
    wd.quit().then(function() {
      driver.stop(callback);
    });
  };

  driver.start(function(options) {
    wd = WD(dalekContext).promiseChainRemote(options.wd);
    wd.init(options.wd).then(function() {
      var _options = _.extend({}, dalekContext, {
        options: options,
        driver: driver,
        wd: wd,
        stop: stop,
      });

      callback(_options);
    }, throwOnError);
  },
  throwOnError,
  throwOnError);
};

module.exports = startDriver;
