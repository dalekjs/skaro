'use strict';

/*
    yes, this file looks ridiculous. But if
    you want  highly specific error messages,
    you gotta do a lot of things by foot
 */

// node
var fs = require('fs');
// modules
var Q = require('q');
// internals
var ConfigError = require('./ConfigError');
var processTemplates = require('./process-templates');
var fileExists = require('./file-exists');
// promises
var readfile = Q.denodeify(fs.readFile);

function processJsonFile(_path, type, env) {
  return fileExists(_path, type)
    .then(function(_path) {
      return readfile(_path, {encoding: 'utf8'});
    })
    .catch(ConfigError.decorateCatch(type, ConfigError.NOT_READABLE, _path))
    .then(function(text) {
      return JSON.parse(text);
    })
    .catch(ConfigError.decorateCatch(type, ConfigError.NOT_PARSEABLE, _path))
    .then(function(data) {
      Object.keys(data).forEach(function(key) {
        data[key] = processTemplates(key, data[key], env, _path);
      });
      return data;
    })
    .catch(ConfigError.decorateCatch(type, ConfigError.VALUE_TEMPLATE, _path));
}

module.exports = processJsonFile;
