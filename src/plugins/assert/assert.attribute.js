// Status: IMPORTED
// Docs: http://dalekjs.com/docs/assertions.html#meth-attr
// Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/assertions.js#L1294-L1368

/*
test.assert.attr('.jumpButton', 'type', 'submit');

// --------------------------------------------------------------------------------------

assert.attribute({
  selector: '.jumpButton', 
  name: 'type',
  expected: 'submit'
});

// --------------------------------------------------------------------------------------
*/
module.exports = function(dalek) {
  var format = dalek.format;
  var driver = dalek.driver;

  // plugin meta data
  var meta = {
    // allow calls like assert.attribute('.some-thing', 'attr-name', 'expected-value')
    signature: ['selector', 'name', 'expected'],
    // mark this plugin capable of handling {match: "all"}
    iterator: true,
    // mark this plugin as capable of handling .not.attribute()
    invertable: true,
  };

  var handler = function(options) {
    // the name invocations of this plugin will show up as
    var label = 'Attribute ' + format.keyword(options.name)
      + ' of ' + format.selector(options.selector)
      + format.compare(options.compare);

    var assertion = new dalek.Assertion(label);

    // TODO: think about signature
    driver.element.attribute(options).then(function(values) {
      if (!values.length) {
        assertion.rejectSelector();
        return;
      }

      values.some(function(value, index) {
        var result = options.compare(value);
        if (result) {
          assertion.rejectWithMessage(index, [
            options.message,
            result,
            ' unexpected ' + format.literal(value)
          ]);
          return true;
        }
      });

      assertion.resolveItems(values.length);
    }, assertion.reject);

    return assertion;
  };

  // register plugin
  dalek.assert('attribute', meta, handler);
};

