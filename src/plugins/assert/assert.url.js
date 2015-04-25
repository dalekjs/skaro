'use strict';
/**
{
  category: 'navigation'
}

# Assert URL

Assert the current document's URL.


## Examples

```js
// compact notation
assert.url('http://dalekjs.com')
// option notation
assert.url({
  expected: 'http://dalekjs.com'
})
```


## Notes


## Compatibility


## See Also


## Dalek 0.0.x Reference

* Docs: http://dalekjs.com/docs/assertions.html#meth-url
* Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/assertions.js#L1207-L1261

```js
test.assert.url('http://doctorwhotv.co.uk/', 'URL is as expected');
```

*/

module.exports = function(dalek) {
  var format = dalek.format;

  // plugin meta data
  var meta = {
    // group to sort the plugin into
    namespace: 'assert',
    // name of the plugin
    name: 'url',
    // allow calls like assert.url('expected-value')
    signature: ['expected'],
    // list of properties that must be specified at the very least
    required: ['expected'],
    // mark this plugin as capable of handling .not.attribute()
    // this should be done only for assertions that have a boolean result (such as "visible", "hidden")
    // for assertions that take a value for comparison, this should be handled via the expected function callback
    invertable: true,
  };

  var handler = function(options) {
    // the name invocations of this plugin will show up as
    var label = 'URL ' + format.expected(options.expected);
    // we're creating an assertion, give dalek that context
    var handle = new dalek.Handle(label, dalek.Handle.ASSERTION, meta.name);

    var handleResponse = function(url) {
      // type of comparison is handed to us by plugin registration
      var result = options.expected(url);
      if (result) {
        // we caught an assertion failure. pass all the possible messages
        // to the assertion instance and have *it* figure out what to show
        handle.rejectWithMessage(null, options.message, result);
        return;
      }

      // all tests passed, if handle was rejected,
      // this call is ignored by the Promise
      handle.resolve(format.link(url));
    };

    dalek.wd
      // query current URL
      .url()
      // verify we're somewhere
      .then(handleResponse, handle.reject)
      // instead of .done() we inform dalek when something went terribly wrong
      .catch(dalek.catch);

    return handle;
  };

  // register plugin
  dalek.registerPlugin(meta, handler);
};
