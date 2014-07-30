module.exports = function(dalek) {
  'use strict';

  dalek.beforeDalek(function() {
    return [
      dalek.action.click('.before-dalek'),
    ];
  });

  dalek.afterDalek(function() {
    return [
      dalek.action.click('.after-dalek'),
    ];
  });

  dalek.beforeSuite(function() {
    return [
      dalek.action.click('.before-suite'),
    ];
  });

  dalek.afterSuite(function() {
    return [
      dalek.action.click('.after-suite'),
    ];
  });

  dalek.suite('name of the suite', function(suite/*, options*/) {

    suite.options({
      foo: 'bar'
    });

    suite.beforeUnit(function() {
      return [
        //dalek.browser.openUrl('localhost');
        dalek.action.click('.before-unit'),
        dalek.assert.attribute('.rainbow', 'color', dalek.is.not.equal('green')),
      ];
    });

    suite.afterUnit(function(options) {
      if (options.succeeded) {
        // unit passed
      } else {
        // unit failed
      }

      return [
        //dalek.log.message('after unit ', succeded ? 'successful' : 'failed');
        dalek.action.click('.after-unit'),
      ];
    });

    suite.unit('first unit', function(/*options*/) {
      return [
        dalek.action.click('.somewhere'),
        dalek.until.timeout(100),
        dalek.assert.attribute('.rainbow', 'color', dalek.is.not.equal('green')),
      ];
    });

    suite.unit('second unit', function(/*options*/) {
      return [
        dalek.action.click('.kansas'),
      ];
    });

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