'use strict';

// we're using dalek as a scope to transport certain dependencies
// so they're available to 3rd party plugins as well…

module.exports = function() {
  var dalekContext = {
    _: require('lodash'),
    Q: require('q'),
  };

  dalekContext.Error = require('../../src/core/DalekError.js')(dalekContext);
  dalekContext.Selector = require('../../src/core/Selector.js')(dalekContext);
  dalekContext.Handle = require('../../src/core/Handle.js')(dalekContext);
  dalekContext.Format = require('../../src/core/Format.js')(dalekContext);

  dalekContext.registry = new (require('../../src/core/Registry.js')(dalekContext))({});
  dalekContext.reporter = new (require('../../src/core/Reporter.js')(dalekContext))({});
  dalekContext.format = new dalekContext.Format({});

  return dalekContext;
};