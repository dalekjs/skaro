module.exports = function(config/*, cli*/) {
  'use strict';

  var Dalek = require('../../index.js');
  var dalek = new Dalek(config);

  return dalek.load()
    .then(dalek.start.bind(dalek))
    .then(dalek.run.bind(dalek))
    .then(dalek.stop.bind(dalek))
    .catch(function(error) {
      dalek.reporter.error(error);
    })
    .then(dalek.kill.bind(dalek))
    .then(dalek.endProcess.bind(dalek));
};