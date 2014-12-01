module.exports = function(dalek) {
  'use strict';

  var WD = require('wd');

  // TODO: create driver interface
  function Driver (options) {
    this.options = options;
  };

  // initialize WD.js
  Driver.prototype.initializeWebdriverConnection = function (options) {
    this.wd = WD.promiseChainRemote('http://' + options.host + ':' + options.port + '/');

    // initializa (aka. get the session id)
    return this.wd.init({browserName: options.id});
  };

  return Driver;
};
