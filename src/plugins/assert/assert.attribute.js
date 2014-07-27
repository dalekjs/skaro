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
  var format = dalek.format;
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
    var assertion = new dalek.Assertion(label);

    driver.element.attribute(options).then(function(values) {
      if (!values.length) {
        assertion.reject('Selector did not match any elements');
        return;
      }

      values.some(function(value, index) {
        var result = options.compare(value);
        var message;
        if (result) {

          // TODO: figure out how we can make messages simpler
          if (options.message) {
            message = options.message;
          } else if (typeof result === string) {
            message = result;
          } else {
            message = ' unexpected ' + format.literal(value);
          }

          assertion.reject(format.index(index) + message);
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

