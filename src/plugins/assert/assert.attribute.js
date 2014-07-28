/**
# Assert Attribute Value

Assert the value of a DOM element's attribute.

## Examples

```js
// compact notation
assert.attribute('.selector', 'attribute-name', 'expected-value');
// option notation
assert.attribute({
  selector: '.selector',
  name: 'attribute-name',
  expected: 'expected-value'
});
```


## Notes

Attribute and Property values may differ. For example, if you want to check an input element's value, you want to check the property `value` (that gets updated through user input, the attribute `value` does not).


## See Also

* assert.property
* assert.value
* assert.disabled
* assert.selected


## Dalek 0.0.x Reference

* Docs: http://dalekjs.com/docs/assertions.html#meth-attr
* Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/assertions.js#L1294-L1368

```js
test.assert.attr('.jumpButton', 'type', 'submit');
```

*/

module.exports = function(dalek) {
  var format = dalek.format;
  var driver = dalek.driver;

  // plugin meta data
  var meta = {
    // allow calls like assert.attribute('.some-thing', 'attr-name', 'expected-value')
    signature: ['selector', 'name', 'expected'],
    // list of properties that must be specified at the very least
    required: ['selector', 'name', 'expected'],
    // mark this plugin capable of handling {match: "all"}
    iterator: true,
    // mark this plugin as capable of handling .not.attribute()
    invertable: true,
  };

  var handler = function(options) {
    // the name invocations of this plugin will show up as
    var label = 'Attribute ' + format.keyword(options.name)
      + ' of ' + format.selector(options.selector)
      + ' ' + format.expected(options.expected);

    // we're creating an assertion, give dalek that context
    var assertion = new dalek.Assertion(label);

    // data we need to pass to WebDriver
    var data = {
      selector: options.selector,
      match: options.match,
      attribute: options.name
    };

    var handleResults = function(values) {
      // walk results, abort with the first failure
      // we always get an array returned, even if a single element was requested
      values.some(function(value, index) {
        // type of comparison is handed to us by plugin registration
        var result = options.expected(value);
        // if we said meta.invertable, we need to interpret
        // the expected() result accordingly (i.e. invert)
        if (!!result === !options.inverted) {
          // we caught an assertion failure. pass all the possible messages
          // to the assertion instance and have *it* figure out what to show
          assertion.rejectWithMessage(index, options.message, result);
          // end the loop, one failure is all we needed
          return true;
        }
      });

      // all tests passed, if assertion was rejected,
      // this call is ignored by the Promise
      assertion.resolveItems(values.length);
    };

    // talk to WebDriver
    driver.element.attribute(data).then(
      // process WebDriver results
      handleResults,
      // WebDriver rejects on empty selector-result with string
      // any errors (including malformed selector) with DalekError
      assertion.reject
    ).catch(dalek.catch);

    return assertion;
  };

  // register plugin
  dalek.assert('attribute', meta, handler);
};
