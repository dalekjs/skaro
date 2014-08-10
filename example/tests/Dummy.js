module.exports = function(dalek) {
  'use strict';

  dalek.beforeDalek(function(/*unit*/) {
    return [
      dalek.action.click('.before-dalek'),
    ];
  });

  dalek.afterDalek(function(/*unit*/) {
    return [
      dalek.action.click('.after-dalek'),
    ];
  });

  dalek.beforeSuite(function(/*unit*/) {
    return [
      dalek.action.click('.before-suite'),
    ];
  });

  dalek.afterSuite(function(/*unit*/) {
    return [
      dalek.action.click('.after-suite'),
    ];
  });

  dalek.suite('name of the suite', function(suite) {

    suite.options({
      foo: 'bar'
    });

    suite.beforeUnit(function(/*unit*/) {
      return [
        //dalek.browser.openUrl('localhost');
        dalek.action.click('.before-unit'),
        dalek.assert.attribute('.rainbow', 'color', dalek.is.not.equal('green')),
      ];
    });

    suite.afterUnit(function(unit) {
      if (unit.options('succeeded')) {
        // unit passed
      } else {
        // unit failed
      }

      return [
        //dalek.log.message('after unit ', succeded ? 'successful' : 'failed');
        dalek.action.click('.after-unit'),
      ];
    });

    suite.unit('first unit', function(/*unit*/) {
      return [
        dalek.action.click('.somewhere'),
        dalek.until.timeout(100),
        dalek.assert.attribute('.rainbow', 'color', dalek.is.not.equal('green')),
      ];
    });

    suite.unit('nested array unit', function(/*unit*/) {
      return [
        [
          dalek.action.click('.kansas')
        ],
        [[[dalek.action.click('.kansas')]]],
      ];
    });

    // suite.unit('no array unit', function(/*unit*/) {
    //   return new Date();
    // });

    // suite.unit('no valid task unit', function(/*unit*/) {
    //   return [new Date()];
    // });

  });

  // dalek.suite('empty suite', function(){});

  dalek.suite('synchronous suite', function(suite) {

    suite.unit('asynchnronous unit', function(/*unit*/) {
      var deferred = dalek.Q.defer();

      setTimeout(function() {
        deferred.resolve([
          // TODO: figure out how to capture errors raised in a timeout
          // dalek.action.foo('.somewhere'),
          
          //inline-function-tasks
          function(/*options*/) {
            var handle = new dalek.Handle('Explain what you are doing', dalek.Handle.ACTION);
            setTimeout(function() {
              handle.resolve('response text');
            });
            return handle;
          }
        ]);
      }, 200);

      return deferred.promise;
    });

  });

};