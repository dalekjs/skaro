module.exports = function(dalek) {
  'use strict';

  dalek.suite('give me some basics', function(suite) {

    suite.unit('basic shit', function(unit) {
      return [
        dalek.browser.open('http://dalekjs.com/guineapig/'),
        dalek.assert.url('http://dalekjs.com/guineapig/'),
        dalek.action.click('a'),
        dalek.assert.attribute({selector: '#unchecked_checkbox', match: 'first', expected: 'unchecked_checkbox', name: 'name'}),
        //dalek.assert.attribute('input', 'name', 'unchecked_checkbox', {match: 'all'})
      ];
    });

  });

};
