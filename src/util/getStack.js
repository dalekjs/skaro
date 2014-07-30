'use strict';

var stackTrace = require('stack-trace');

// extract the useful (developer-relevant) parts of the call-stack
// to present in case of problems during plugin call and exection-time
module.exports = function getStack(below) {
  // https://github.com/felixge/node-stack-trace
  var stack = [];
  var trace = stackTrace.get(below);

  trace.some(function(callSite) {
    var site = {
      name: callSite.getFunctionName(),
      file: callSite.getFileName(),
      line: callSite.getLineNumber(),
    };

    // we don't care about anything deeper than this
    if (site.name === 'Module._compile') {
      return true;
    }

    stack.push(site);
    return false;
  });

  return stack;
};