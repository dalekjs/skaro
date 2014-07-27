module.exports = function (dalek, assert, action, wait) {

  // set options that are valid for the methods in this invocation only
  // meaning they have to be re-set for every file
  dalek.options({
    selectorStrategy: 'xpath',
  });

  dalek.unit('Page title is correct', function (options) {
    return [
      action.openUrl('google.com', {username: "foo", password: "bar"}),
      // Error: could not openUrl(google.com) - demo-1.js:5

      until.event('load window', {timeout: 5000, retry: 1, repeat: 2}),
      // Error: event "load" on "window" not received - demo-1.js:8

      // WebDriver method
      assert.title('head title', 'Google'),
      // Error: attribute "title" of "head title" is "foobar" but "Google" was expected - demo-1.js:11

      // working with custom comparison functions
      assert.attribute('.selector', 'attr-name', 'value')
      assert.attribute('.selector', 'attr-name', function(val){ return "no nononp"; })
      assert.attribute('.selector', 'attr-name', is.between(2, 3))

      // dealing with simple inversion of boolean comparison
      assert.visible('selector')
      assert.not.visible('selector')

      // associate the wait (reaction) with the click (action)
      action.click('#button')
        .until.visible('#dialog'),



      assert.text({
        selector: 'p'.css,
        match: 'all',
        // literal value
        expected: 'Google',
        // callback run in dalek
        expected: function(text) {
          return text.indexOf('foo') > -1;
        }
      }),
      // Error: text of "p" is "foobar" but "Google" was expected - demo-1.js:15

    ];
  });


};


module.exports = {
  'Page title is correct': function (test) {
    test
      .open('http://google.com')
      .assert.title().is('Google', 'It has title')
      .done();
    }
};



/*
 *  TEST: waiting for DOM event
 */
module.exports = function (dalek, assert, action, wait) {
  return [
    // single event
    until.event('load window', {timeout: 5000, retry: 1}),

    // mutlitple events
    until.event({
      'load window': {timeout: 5000, retry: 1},
      'load window': {timeout: 5000, retry: 1},
    }, {mode: "any|all"}),

    // mutlitple events without selector-DSL
    until.event([
      {name: 'load', selector: 'window', timeout: 5000, retry: 1},
      {name: 'load', selector: 'window', timeout: 5000, retry: 1},
    ], {mode: "any|all"}),

    // Fully Qualified Example
    until.event({
      name: 'transitionend',
      selector: '#some-selector'.css,
      match: 'first',
      timeout: 5000,
      retry: 1,
      message: 'width did not animate',
      // this function is run in the browser!
      filter: function(event) {
        if (event.propertyName === 'width') {
          // this is the event we were looking for
          return true;
        }

        // act like this event has never happened
        return false;
      }
    }),
    // until.event(array, options)
  ];
};

/*
 * TEST: waiting for an element to show up
 */
module.exports = function (dalek, assert, action, wait) {
  return [

    // simple click and wait for something to show
    action.click('#button'),
    until.visible('#dialog'),

    // associate the wait (reaction) with the click (action)
    action.click('#button')
      .until.visible('#dialog'),

    // with default options
    until.visible('#dialog', {timeout: 5000, retry: 1})

    // Fully Qualified Example
    until.visible({
      selector: '#dialog'.css,
      match: 'first',
      timeout: 5000,
      retry: 1,
      // opacity, transform, …
    }

  ];
};
