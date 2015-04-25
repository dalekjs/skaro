'use strict';
/**
{
  category: 'dom'
}

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


## Compatibility


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

  // plugin meta data
  var meta = {
    // group to sort the plugin into
    namespace: 'assert',
    // name of the plugin
    name: 'attribute',
    // allow calls like assert.attribute('.some-thing', 'attr-name', 'expected-value')
    signature: ['selector', 'name', 'expected'],
    // list of properties that must be specified at the very least
    required: ['selector', 'name', 'expected'],
    // mark this plugin capable of handling {match: "all"}
    iterator: true,
    // mark this plugin as capable of handling .not.attribute()
    // this should be done only for assertions that have a boolean result (such as "visible", "hidden")
    // for assertions that take a value for comparison, this should be handled via the expected function callback
    invertable: false,
  };

  var handler = function(options) {
    // the name invocations of this plugin will show up as
    /*jshint laxbreak:true */
    var label = 'Attribute ' + format.keyword(options.name)
      + ' of ' + format.selector(options.selector)
      + ' ' + format.expected(options.expected);
    /*jshint laxbreak:false */

    // we're creating an assertion, give dalek that context
    var handle = new dalek.Handle(label, dalek.Handle.ASSERTION, meta.name);

    var trigger = function (elements) {
      return dalek.Q.all(elements.map(function(element) {
        return dalek.wd.getAttribute(element, options.name);
      }));
    };

    var verify = function(values) {
      // walk results, abort with the first failure
      // we always get an array returned, even if a single element was requested
      values.some(function(value, index) {
        // type of comparison is handed to us by plugin registration
        var result = options.expected(value);
        if (result) {
          // we caught an assertion failure. pass all the possible messages
          // to the assertion instance and have *it* figure out what to show
          handle.rejectWithMessage(index, options.message, result);
          // end the loop, one failure is all we needed
          return true;
        }
      });

      // all tests passed, if handle was rejected,
      // this call is ignored by the Promise
      handle.resolveItems(values.length);
    };

    // load all elements
    dalek.wd
      .matchElements(options)
      .then(trigger, handle.reject)
      .then(verify, handle.reject)
      .catch(dalek.catch);

    return handle;
  };

  // register plugin
  dalek.registerPlugin(meta, handler);
};
