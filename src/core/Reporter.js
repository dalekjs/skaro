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

  Reporter.prototype.error = function(error) {
    console.log('\n');

    if (error instanceof dalek.Error) {
      console.log(chalk.bgRed.white.bold(error.message));
      if (!error._stack) {
        console.log(error.stack);
        return;
      } else 

      error._stack.forEach(function(callSite) {
        console.log(' at ' + chalk.red(callSite.name) + ' (' + chalk.yellow(callSite.file) + ':' + chalk.cyan(callSite.line) + ')' );
      });
      
      return;
    }

    // regular Error
    console.log(error.stack || error);
  }

  return Reporter;
};