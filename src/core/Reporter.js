/*
    The Reporter is the interface used to broadcast messages to
    any and all connected reporter instances
 */

// https://www.npmjs.org/package/chalk
var chalk = require('chalk');

module.exports = function(dalek) {
  'use strict';

  var Handle = dalek.Handle;

  function Reporter(options) {
    this.options = options;
    this.reporters = [];
  }

  Reporter.prototype.add = function(reporter) {
    this.reporters.push(reporter);
  };

  Reporter.prototype.started = function(handle) {
    var label = chalk.bgBlack.yellow(handle.label);
    switch (handle.type) {
      case Handle.SUITE:
        console.log('\n------------------------------------------------------------\n');
        console.log(chalk.bgBlue.white('Suite'), label, 'with', handle.operationsPlanned, 'units');
        break;

      case Handle.UNIT:
        console.log('\n');
        console.log('', chalk.bgBlue.white('Unit'), label, 'with', handle.operationsPlanned, 'tasks');
        break;

      case Handle.ASSERTION:
        console.log('  ', chalk.bgBlue.white('Assertion'), label);
        break;

      case Handle.UNTIL:
        console.log('  ', chalk.bgCyan.black('Wait'), label);
        break;

      //case Handle.ACTION:
      default:
        console.log('  ', chalk.bgMagenta.white('Action'), label);
        break;
    }
  };

  Reporter.prototype.retried = function(/*handle, retryHandle*/) {
    // TODO: implement retry
    //console.log('  ', chalk.blue('retrying'), chalk.bgBlack.blue(handle.label));
  };

  Reporter.prototype.succeeded = function(handle, message) {
    // message only supplied for Tasks, but not Unit and Suite
    var _message = chalk.bgBlack.white(message);
    var _success = chalk.bgBlack.green('⌞ success');
    switch (handle.type) {
      case Handle.SUITE:
        console.log(_success, chalk.bgBlack.white('Suite passed'), chalk.bgBlack.yellow(handle.operationsPerformed), 'Units');
        break;

      case Handle.UNIT:
        console.log('', _success, chalk.bgBlack.white('Unit passed'), chalk.bgBlack.yellow(handle.operationsPerformed), 'Tasks');
        break;

      case Handle.ASSERTION:
        console.log('  ', _success, _message);
        break;

      case Handle.UNTIL:
        console.log('  ', _success, _message);
        break;

      //case Handle.ACTION:
      default:
        console.log('  ', _success, _message);
        break;
    }
  };

  Reporter.prototype.failed = function(handle, message) {
    // message is failure response of task in Unit,
    // handle of failed task in Suite
    var _message = chalk.bgRed.white(message);
    var _error = chalk.bgBlack.red('⌞ error');
    switch (handle.type) {
      case Handle.SUITE:
        console.log(_error, chalk.bgRed.white('Suite failed'), 'in Unit', chalk.bgBlack.yellow(handle.operationsPerformed), 'of', chalk.bgBlack.yellow(handle.operationsPlanned));
        break;

      case Handle.UNIT:
        console.log('', _error, chalk.bgRed.white('Unit failed'), 'in Task', chalk.bgBlack.yellow(handle.operationsPerformed), 'of', chalk.bgBlack.yellow(handle.operationsPlanned));
        break;

      case Handle.ASSERTION:
        console.log('  ', _error, _message);
        break;

      case Handle.UNTIL:
        console.log('  ', _error, _message);
        break;

      //case Handle.ACTION:
      default:
        console.log('  ', _error, _message);
        break;
    }
  };



  Reporter.prototype.log = function() {
    if (this.options.silent) {
      return;
    }

    console.log.apply(console, arguments);
  };

  Reporter.prototype.debug = function() {
    if (this.options.silent) {
      return;
    }

    var args = serialize(arguments).map(function(item) {
      return chalk.bgWhite.blue(item);
    });

    console.log.apply(console, args);
  };

  Reporter.prototype.warning = function() {
    if (this.options.silent) {
      return;
    }

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
      } 

      error._stack.forEach(function(callSite) {
        console.log(' at ' + chalk.red(callSite.name) + ' (' + chalk.yellow(callSite.file) + ':' + chalk.cyan(callSite.line) + ')' );
      });
      
      return;
    }

    // regular Error
    console.log(error.stack || error);
  };

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

  return Reporter;
};