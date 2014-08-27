'use strict';

// node
var fs = require('fs');
// modules
var Q = require('q');
// internals
var ConfigError = require('./ConfigError');
// promises
var lstat = Q.denodeify(fs.lstat);

module.exports = function fileExists(_path, type) {
  return lstat(_path)
    .thenResolve(_path)
    .catch(ConfigError.decorateCatch(type, ConfigError.NOT_FOUND, _path))
};