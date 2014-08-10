module.exports = function(config/*, cli*/) {
  'use strict';

  var Dalek = require('../../index.js');
  var dalek = new Dalek(config);

  return dalek.load()
    .then(dalek.start.bind(dalek))
    .then(dalek.run.bind(dalek))
    .catch(function(error) {
      if (error instanceof dalek.Handle) {
        // not an error we need to log
        return;
      }

      dalek.reporter.error(error);
    })
    .then(dalek.stop.bind(dalek))
    .catch(dalek.reporter.error.bind(dalek))
    .then(dalek.kill.bind(dalek))
    .then(dalek.endProcess.bind(dalek));
};