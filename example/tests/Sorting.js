module.exports = function(dalek) {
  'use strict';

  // --sort none|alpha|random
  // sort.suites sort.units

  function dummy(/*options*/) {
    var handle = new dalek.Handle('Explain what you are doing', dalek.Handle.ACTION);
    setTimeout(function() {
      handle.resolve('response text');
    });
    return handle;
  }

  dalek.suite('bravo suite', function(suite) {
    suite.unit('charlie unit', function(/*options*/) {
      return [dummy];
    });

    suite.unit('bravo unit', function(/*options*/) {
      return [dummy];
    });

    suite.unit('alpha unit', function(/*options*/) {
      return [dummy];
    });
  });

  dalek.suite('alpha suite', function(suite) {
    suite.unit('charlie unit', function(/*options*/) {
      return [dummy];
    });

    suite.unit('Bravo unit', function(/*options*/) {
      return [dummy];
    });

    suite.unit('alpha unit', function(/*options*/) {
      return [dummy];
    });
  });

  dalek.suite('älpha suite', function(suite) {
    suite.unit('charlie unit', function(/*options*/) {
      return [dummy];
    });

    suite.unit('Bravo unit', function(/*options*/) {
      return [dummy];
    });

    suite.unit('alpha unit', function(/*options*/) {
      return [dummy];
    });
  });
};