module.exports = function(dalek) {
  'use strict';

  dalek.suite('simple suite', function(suite) {

    suite.unit('simple unit', function(unit) {
      return [
        // open a website
        browser.open('http://dalekjs.com/guineapig/'),
        // verify we weren't redirected
        assert.url('http://dalekjs.com/guineapig/'),
        // click on the first link found in the document
        action.click('a'),
        // make sure the name attribute has the correct value
        assert.attribute({
          selector: '#unchecked_checkbox',
          match: 'first',
          expected: 'unchecked_checkbox',
          name: 'name',
        }),
        // type something (without keyboard events for every character)
        action.setValue('input[type="text"]', 'Foo', { match: 'all' }),
        // test multiple attributes
        // TODO: wouldn't this need to test *property* instead of *attribute*?
        assert.attribute('input[type="text"]', 'value', 'Foo', {
          match: function (element, index, list) {
            // test everything but the second element
            return index !== 1;
          }
        }),
      ];
    });

  });

};
