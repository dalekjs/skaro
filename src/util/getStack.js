'use strict';

var stackTrace = require('stack-trace');

// extract the useful (developer-relevant) parts of the call-stack
// to present in case of problems during plugin call and exection-time
module.exports = function getStack(below, error, skip) {
  // https://github.com/felixge/node-stack-trace
  var stack = [];
  var trace = error && stackTrace.parse(error) || stackTrace.get(below);

  trace.some(function(callSite) {
    if (skip) {
      skip--;
      return false;
    }

    var site = {
      name: callSite.getFunctionName(),
      file: callSite.getFileName(),
      line: callSite.getLineNumber(),
    };

    // we don't care about the dalek internals
    // at registration time
    if (site.file && site.file.indexOf('src/Dalek.js') === site.file.length -12) {
      return true;
    }
    if (site.name === 'Unit.initialize') {
      // consider renaming the previous item from "Unit._initialize" 
      // to something meaningful to the user
      return true;
    }
    

    // we don't care about anything deeper than this
    if (site.name === 'Module._compile' || site.name === 'listOnTimeout') {
      return true;
    }

    stack.push(site);
    return false;
  });

  return stack;
};