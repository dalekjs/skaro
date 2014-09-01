'use strict';

var path = require('path');
var _ = require('lodash');

var Config = require('../src/config/Config');
var Dalek = require('../src/Dalek');

module.exports = function createDalekTestInstance(options, files) {
  options = _.extend(_.clone(options || {}), {
    silent: true,
    plugins: path.resolve(__dirname, 'plugins') + '/**/*.js',
  });

  var config = new Config(options, files || []);
  return config.load().then(function(config) {
    return new Dalek(config);
  });
};
