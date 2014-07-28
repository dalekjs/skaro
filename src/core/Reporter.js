/*
    The Reporter is the interface used to broadcast messages to
    any and all connected reporter instances
 */

// https://www.npmjs.org/package/chalk
var chalk = require('chalk');

function serialize(args) {
  return [].slice.call(args, 0).map(function(item) {
    if (typeof item === 'function') {
      return String(item);
    }
    if (typeof item === 'object') {
      return JSON.stringify(item, null, 2);
    }

    return item;
  });
}

module.exports = function(dalek) {

  function Reporter(options) {
    this.options = options;
    this.reporters = [];
  }

  Reporter.prototype.add = function(reporter) {
    this.reporters.push(reporter);
  };

  Reporter.prototype.log = function() {
    console.log.apply(console, arguments);
  };

  Reporter.prototype.debug = function() {
    var args = serialize(arguments).map(function(item) {
      return chalk.bgWhite.blue(item);
    });

    console.log.apply(console, args);
  };

  Reporter.prototype.warning = function() {
    var args = serialize(arguments).map(function(item) {
      return chalk.bgYellow.red.bold(item);
    });

    console.log.apply(console, args);
  };

  return Reporter;
};