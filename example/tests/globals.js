module.exports = function(dalek) {
  'use strict';

  dalek.suite('name of the suite', function(suite) {
    suite.unit('unit using globals', function(/*unit*/) {
      return [
        action.click('.somewhere'),
        until.timeout(100),
        assert.attribute('.rainbow', 'color', is.not.equal('green')),
      ];
    });
  });

};