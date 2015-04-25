module.exports = function(config) {
  'use strict';

  var Dalek = require('../../index.js');
  var dalek = new Dalek(config);

  // TODO: how handle signals like SIGINT? - https://nodejs.org/api/process.html#process_signal_events

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