module.exports = function(dalek) {
  'use strict';

  var path = require('path');

  var glob = require('glob');
  var wd = require('wd');

  var _pattern = path.resolve(__dirname, '../wd/**/*.js');
  var _options = {
    silent: true,
    strict: true
  };

  glob.sync(_pattern, _options).forEach(function(path) {
    require(path)(dalek, wd);
  });

  return wd;
};
