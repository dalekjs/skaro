module.exports = function(dalek) {
  'use strict';

  return;

  dalek.beforeDalek(function(/*unit*/) {
    // simple script error
    unknown();
    return [
      // calling unknown plugin
      dalek.action.unknown('.before-dalek'),
    ];
  });

  dalek.afterDalek(function(/*unit*/) {
    return [
      dalek.action.unknown('.before-dalek'),
    ];
  });

  dalek.beforeSuite(function(/*unit*/) {
    return [
      dalek.action.unknown('.before-dalek'),
    ];
  });

  dalek.afterSuite(function(/*unit*/) {
    return [
      dalek.action.unknown('.before-dalek'),
    ];
  });

  dalek.suite('script errors', function(suite) {
    // simple script error
    unknown();

    suite.unit('script error', function(/*unit*/) {
      // simple script error
      unknown();
    });

    suite.unit('unknown plugin', function(/*unit*/) {
      return [
        // calling unknown plugin
        dalek.action.unknown('.before-dalek'),
      ];
    });

    // Same problems need to be tested for async suites/units
  });

  dalek.suite('invalid units', function(suite) {

    suite.unit('no array unit', function(/*unit*/) {
      return new Date();
    });

    suite.unit('no valid task unit', function(/*unit*/) {
      return [new Date()];
    });

  });

  dalek.suite('empty suite', function() {
    // empty suite
  });

  dalek.suite('asynchronous units', function(suite) {

    suite.unit('script error', function(/*unit*/) {
      var deferred = dalek.Q.defer();

      setTimeout(function() {
        // simple script error
        unknown();
      }, 200);

      return deferred.promise;
    });

    suite.unit('unknown plugin', function(/*unit*/) {
      var deferred = dalek.Q.defer();

      setTimeout(function() {
        // calling unknown plugin
        deferred.resolve([
          dalek.action.unknown('.somewhere')
        ]);
      }, 200);

      return deferred.promise;
    });

  });

};