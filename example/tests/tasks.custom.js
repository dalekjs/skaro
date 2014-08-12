/*global action*/
module.exports = function(dalek) {
  'use strict';

  dalek.suite('script errors', function(suite) {
    suite.unit('unknown plugin', function(/*unit*/) {
      return [
        // task that does not return a Handle is treated synchronously,
        // its return value will be the success message
        function customTaskSync() {
          console.log('task executed');
        },
        // task that returns a promise is treated asynchronously
        // whatever it resolves/rejects the promise with, will be the status message
        function customTaskAsyc() {
          var deferred = dalek.Q.defer();
          setTimeout(function(){
            deferred.resolve('yep, it worked');
          }, 200);
          return deferred.promise;
        },
        // regular plugin task, to make sure things ran through
        action.click('.selector'),
      ];
    });
  });

};