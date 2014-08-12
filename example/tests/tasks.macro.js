/*global action, assert, is */
module.exports = function(dalek) {
  'use strict';

  dalek.registerMacro('myFirstMacro', function(unit, options) {
    return [
      action.click('.myFirstMacro-1-' + options.some),
      action.click('.myFirstMacro-2-' + options.some),
      // assert.attribute('.rainbow', 'color', is.equal('green')),
      action.click('.myFirstMacro-4-' + options.some),
    ]
  });

  dalek.suite('macro tasks', function(suite) {
    suite.unit('using macro task', function(/*unit*/) {
      return [
        action.click('.before-macro'),
        macro.myFirstMacro({
          some: 'options'
        }),
        action.click('.after-macro'),
      ];
    });
  });

};