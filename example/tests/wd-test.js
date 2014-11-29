module.exports = function(dalek) {
  'use strict';

  dalek.suite('give me some basics', function(suite) {

    suite.unit('basic shit', function(unit) {
      return [
        dalek.browser.open('http://dalekjs.com/guineapig/'),
        dalek.assert.url('http://dalekjs.com/guineapig/')
      ];
    });

  });

};
