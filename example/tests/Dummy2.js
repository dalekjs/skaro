module.exports = function(dalek) {
  'use strict';

  dalek.beforeSuite(function(/*unit*/) {
    // this should cause a warning
    return [];
  });

  dalek.suite('asynchronous suite', function(suite) {
    var deferred = dalek.Q.defer();

    setTimeout(function(){
      suite.unit('synchronous unit', function(/*unit*/) {
        return [
          //inline-function-tasks
          function(/*options*/) {
            var handle = new dalek.Handle('Explain what you are doing', dalek.Handle.ACTION);
            setTimeout(function() {
              handle.resolve('response text');
            });
            return handle;
          }
        ];
      });
      deferred.resolve();
    }, 200);

    return deferred.promise;
  });

};