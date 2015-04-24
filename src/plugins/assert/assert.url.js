'use strict';
/**
{
  category: 'navigation'
}

# Name Of Plugin

Description Of Plugin


## Examples

```js
// compact notation
assert.url('expected text')
// option notation
assert.url({
  expected: 'expected text'
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
  var driver = dalek.driver;

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
    /*jshint laxbreak:true */
    var label = 'URL ' + format.expected(options.expected);
    /*jshint laxbreak:false */

    // we're creating an assertion, give dalek that context
    var handle = new dalek.Handle(label, dalek.Handle.ASSERTION, meta.name);

    // data we need to pass to WebDriver
    var data = {
      match: options.match
    };

    var handleResults = function(value) {
      // type of comparison is handed to us by plugin registration
      var result = options.expected(value);
      if (result) {
        // we caught an assertion failure. pass all the possible messages
        // to the assertion instance and have *it* figure out what to show
        handle.rejectWithMessage(value, options.message, result);
        // end the loop, one failure is all we needed
        return true;
      }

      // all tests passed, if handle was rejected,
      // this call is ignored by the Promise
      handle.resolveNavigation(value);
    };

    // talk to WebDriver
    dalek.wd.url().then(
      // process WebDriver results
      handleResults,
      // WebDriver rejects on empty selector-result with string
      // any errors (including malformed selector) with DalekError
      handle.reject
    ).catch(dalek.catch);

    return handle;
  };

  // register plugin
  dalek.registerPlugin(meta, handler);
};
