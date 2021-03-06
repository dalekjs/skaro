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

    this.log = this.log.bind(this);
    this.debug = this.debug.bind(this);
    this.warning = this.warning.bind(this);
    this.error = this.error.bind(this);
  }

  Reporter.prototype.add = function(reporter) {
    this.reporters.push(reporter);
  };

  Reporter.prototype.started = function(handle) {
    if (this.options.silent) {
      return;
    }

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

      case Handle.UNIT_BEFORE_FIRST:
      case Handle.UNIT_BEFORE_EACH:
      case Handle.UNIT_AFTER_EACH:
      case Handle.UNIT_AFTER_LAST:
        console.log(' ', chalk.bgBlue.grey('Unit'), label, 'with', handle.operationsPlanned, 'tasks');
        break;

      case Handle.UNIT_MACRO:
        console.log('  ', chalk.bgBlue.white('Macro'), label, 'with', handle.operationsPlanned, 'tasks');
        break;

      //case Handle.ACTION:
      default:
        console.log('  ', chalk.bgMagenta.white('Action'), label);
        break;
    }
  };

  Reporter.prototype.retried = function(/*handle, retryHandle*/) {
    if (this.options.silent) {
      return;
    }

    // TODO: implement retry
    //console.log('  ', chalk.blue('retrying'), chalk.bgBlack.blue(handle.label));
  };

  Reporter.prototype.succeeded = function(handle, message) {
    if (this.options.silent) {
      return;
    }

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

      case Handle.UNIT_BEFORE_FIRST:
      case Handle.UNIT_BEFORE_EACH:
      case Handle.UNIT_AFTER_EACH:
      case Handle.UNIT_AFTER_LAST:
        console.log(' ', _success, chalk.bgBlue.grey('Unit passed'), chalk.bgBlack.yellow(handle.operationsPerformed), 'Tasks');
        break;

      case Handle.UNIT_MACRO:
        console.log('  ', _success, chalk.bgBlue.white('Macro passed'), chalk.bgBlack.yellow(handle.operationsPerformed), 'Tasks');
        break;

      //case Handle.ACTION:
      default:
        console.log('  ', _success, _message);
        break;
    }
  };

  Reporter.prototype.failed = function(handle, message) {
    if (this.options.silent) {
      return;
    }

    // message is failure response of task in Unit,
    // handle of failed task in Suite
    var _message = chalk.bgRed.white(message);
    var _error = chalk.bgBlack.red('⌞ error');
    var _indent = '';
    switch (handle.type) {
      case Handle.SUITE:
        console.log(_error, chalk.bgRed.white('Suite failed'), 'in Unit', chalk.bgBlack.yellow(handle.operationsPerformed), 'of', chalk.bgBlack.yellow(handle.operationsPlanned));
        break;

      case Handle.UNIT:
        console.log(_indent, _error, chalk.bgRed.white('Unit failed'), 'in Task', chalk.bgBlack.yellow(handle.operationsPerformed), 'of', chalk.bgBlack.yellow(handle.operationsPlanned));
        break;

      case Handle.ASSERTION:
        _indent = '  ';
        console.log(_indent, _error, _message);
        break;

      case Handle.UNTIL:
        _indent = '  ';
        console.log(_indent, _error, _message);
        break;

      case Handle.UNIT_BEFORE_FIRST:
      case Handle.UNIT_BEFORE_EACH:
      case Handle.UNIT_AFTER_EACH:
      case Handle.UNIT_AFTER_LAST:
        _indent = ' ';
        console.log(_indent, _error, chalk.bgRed.grey('Unit failed'), 'in Task', chalk.bgBlack.yellow(handle.operationsPerformed), 'of', chalk.bgBlack.yellow(handle.operationsPlanned));
        break;

      case Handle.UNIT_MACRO:
        _indent = '  ';
        console.log(_indent, _error, chalk.bgRed.white('Macro failed'), 'in Task', chalk.bgBlack.yellow(handle.operationsPerformed), 'of', chalk.bgBlack.yellow(handle.operationsPlanned));
        break;

      //case Handle.ACTION:
      default:
        _indent = '  ';
        console.log(_indent, _error, _message);
        break;
    }
    this.printExtra(message);
  };

  Reporter.prototype.log = function() {
    if (!this.options.debug) {
      return;
    }

    console.log.apply(console, arguments);
  };

  Reporter.prototype.debug = function() {
    if (!this.options.debug || this.options.silent) {
      return;
    }

    var args = [].slice.call(arguments, 0);
    args.unshift(chalk.bgWhite.black.bold('Debug:'));
    console.log.apply(console, args);
  };

  Reporter.prototype.warning = function() {
    if (this.options.silent || this.options.warnings === false) {
      return;
    }

    var args = [].slice.call(arguments, 0);
    args.unshift(chalk.bgYellow.red.bold('Warning:'));
    console.log.apply(console, args);
  };

  Reporter.prototype.error = function(error) {

    // TODO: should Reporter#error() print to STDERR?
    console.log('\n');
    console.log(chalk.bgRed.white.bold(error.message));

    if (error._stack !== false) {
      if (!error._stack) {
        error._stack = dalek.getStack(null, error);
      }

      this.printStack(error._stack, null, error.showStackTillName);
    }

    this.printExtra(error);
  };

  Reporter.prototype.printStack = function(stack, level, showStackTillName) {
    if (level === 'warning' && (this.options.silent || this.options.warnings === false)) {
      return;
    } else if (level === 'debug' && (this.options.silent || !this.options.debug)) {
      return;
    }

    stack.some(function(callSite) {
      if (callSite.name === showStackTillName) {
        return true;
      }

      console.log(' at ' + chalk.red(callSite.name) + ' (' + chalk.yellow(callSite.file) + ':' + chalk.cyan(callSite.line) + ')' );
      return false;
    });
  };

  Reporter.prototype.printExtra = function(error, indent) {
    if (!(error instanceof dalek.Error) || !error.extra) {
      return;
    }

    var _indent = [];
    if (indent) {
      _indent.push(indent);
    }

    if (error.extra.extended) {
      console.log.apply(console, _indent.concat(
        chalk.bgCyan.black(error.extra.extended)
      ));
    }
    if (error.extra.url) {
      console.log.apply(console, _indent.concat(
        chalk.bgCyan.blue('see ' + dalek.format.link(error.extra.url, error.extra.title))
      ));
    }
  };

  return Reporter;
};