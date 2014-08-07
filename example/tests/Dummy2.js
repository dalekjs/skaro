module.exports = function(dalek) {
  'use strict';

  dalek.beforeSuite(function() {
    // this should cause a warning
    return [];
  });

  dalek.suite('other suite', function(suite) {

    suite.unit('lalalal', function(/*options*/) {
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

  });

};