// Status: IMPORTED
// Docs: http://dalekjs.com/docs/assertions.html#meth-attr
// Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/assertions.js#L1294-L1368


test.assert.attr('.jumpButton', 'type', 'submit');

// --------------------------------------------------------------------------------------

assert.attribute({
  selector: '.jumpButton', 
  name: 'type',
  expected: 'submit'
});

// --------------------------------------------------------------------------------------

module.exports = function(dalek) {
  // TODO: create color and text-output interface [keyword, selector, literal, index]
  var format = dalek.format;
  // TODO: create driver interface
  var driver = dalek.driver;

  // plugin meta data
  var meta = {
    // allow calls like assert.attribute('.some-thing', 'attr-name', 'expected-value')
    signature: ['selector', 'name', 'expected'],
    // mark this plugin capable of handling {match: "all"}
    iterator: true,
  };

  // the name invocations of this plugin will show up as
  var label = 'Attribute ' + format.keyword(options.name) 
      + ' of ' + format.selector(options.selector) 
      + ' equals ' + format.literal(options.value);

  var handler = function(options) {
    // TODO: create Assertion (with promise interface)
    var assertion = new dalek.Assertion(label);

    // TODO: define interface for access from plugins
    // resolve(['value of element1', 'value of element2', …])
    // reject('Selector did not match any elements')
    driver.element.attribute(options).then(function(values) {
      if (!values.length) {
        assertion.reject('Selector did not match any elements');
        return;
      }

      values.some(function(value, index) {
        // TODO: the wrapping done in dalek.assert() has to register the function 
        // compare(value) { return options. }
        var result = options.compare(value);
        var message;
        if (result) {
          if (options.message) {
            // TODO: figure out how this can play in
            message = options.message;
          } else if (typeof result === string) {
            message = result;
          } else {
            message = format.index(index) + ' unexpected ' + format.literal(value);
          }
          assertion.reject(message);
          return true;
        }
      });

      assertion.resolve(format.index(values.length) + ' elements passed');
    }, assertion.reject);

    return assertion;
  };

  // register plugin
  dalek.assert('attribute', meta, handler);
};

