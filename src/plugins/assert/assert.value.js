'use strict';
/**
{
  category: 'form'
}

# Assert value

Assert the value of a DOM element


## Examples

```js
// compact notation
assert.value('.selector', 'expected text');
// option notation
assert.value({
  selector: '.selector',
  expected: 'expected text'
});
```


## Notes


## Compatibility


## See Also


## Dalek 0.0.x Reference

* Docs: http://dalekjs.com/docs/assertions.html#meth-val
* Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/assertions.js#L346-L408

```js
test.assert.val('#the-doctors', 10, 'David is the favourite')
```

*/

module.exports = function(dalek) {
  var format = dalek.format;

  // plugin meta data
  var meta = {
    // group to sort the plugin into
    namespace: 'assert',
    // name of the plugin
    name: 'value',
    // allow calls like assert.attribute('.some-thing', 'attr-name', 'expected-value')
    signature: ['selector', 'expected'],
    // list of properties that must be specified at the very least
    required: ['selector', 'expected'],
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
    var label = 'Value of '
      + format.selector(options.selector)
      + ' '
      + format.expected(options.expected);
    /*jshint laxbreak:false */

    // we're creating an assertion, give dalek that context
    var handle = new dalek.Handle(label, dalek.Handle.ASSERTION, meta.name);

    var trigger = function (elements) {
      return dalek.Q.all(elements.map(function(element) {
        return dalek.wd.getValue(element);
      }));
    };

    var verify = function(values) {
      // walk results, abort with the first failure
      // we always get an array returned, even if a single element was requested
      values.some(function(value, index) {
        var result = options.expected(value);
        if (result) {
          // we caught an assertion failure. pass all the possible messages
          // to the assertion instance and have *it* figure out what to show
          handle.rejectWithMessage(index, options.message, value);
          // end the loop, one failure is all we needed
          return true;
        }
      });

      // all tests passed, if handle was rejected,
      // this call is ignored by the Promise
      handle.resolveItems(values.length);
    };

    dalek.wd
      // using dalek's simplified element matcher
      .matchElements(options)
      // we dispatch our real test
      .then(trigger, handle.reject)
      .then(verify, handle.reject)
      // instead of .done() we inform dalek when something went terribly wrong
      .catch(dalek.catch);

    return handle;
  };

  // register plugin
  dalek.registerPlugin(meta, handler);
};
