/**
{
  category: 'form'
}

# Assert Selected

Assert elements are selected (`<option>`) or checked (`<input type="checkbox|radio">`).


## Examples

```js
assert.selected(selector)
assert.not.selected(selector)
```


## Notes


## Compatibility


## See Also


## Dalek 0.0.x Reference

* Docs: http://dalekjs.com/docs/assertions.html#meth-selected
* Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/assertions.js#L589-L638

```js
test.assert.selected('#checked_checkbox')
```

*/

module.exports = function(dalek) {
  var format = dalek.format;

  // plugin meta data
  var meta = {
    // group to sort the plugin into
    namespace: 'assert',
    // name of the plugin
    name: 'selected',
    // allow calls like assert.attribute('.some-thing', 'attr-name', 'expected-value')
    signature: ['selector'],
    // list of properties that must be specified at the very least
    required: ['selector'],
    // mark this plugin capable of handling {match: "all"}
    iterator: true,
    // mark this plugin as capable of handling .not.attribute()
    // this should be done only for assertions that have a boolean result (such as "visible", "hidden")
    // for assertions that take a value for comparison, this should be handled via the expected function callback
    invertable: true,
  };

  var handler = function(options) {
    // the name invocations of this plugin will show up as
    /*jshint laxbreak:true */
    var label = 'Element ' + format.selector(options.selector)
      + (options.inverted ? ' is not selected' : ' is selected');
    /*jshint laxbreak:false */

    // we're creating an assertion, give dalek that context
    var handle = new dalek.Handle(label, dalek.Handle.ASSERTION, meta.name);

    var isSelectedElements = function (elements) {
      return dalek.Q.all(elements.map(function(element) {
        return dalek.wd.isSelected(element);
      }));
    };

    var verifySelectedStates = function(values) {
      // walk results, abort with the first failure
      // we always get an array returned, even if a single element was requested
      values.some(function(value, index) {
        if (Boolean(value) === Boolean(options.inverted)) {
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
      .then(isSelectedElements, handle.reject)
      .then(verifySelectedStates, handle.reject)
      // instead of .done() we inform dalek when something went terribly wrong
      .catch(dalek.catch);

    return handle;
  };

  // register plugin
  dalek.registerPlugin(meta, handler);
};
