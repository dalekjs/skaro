'use strict';
/**
# Wait for fixed duration

Wait for a given amount of time.


## Examples

```js
// compact notation
until.timeout(10000);
// option notation
until.timeout({
  timeout: 10000
});
```


## Notes

This is the least elegant way to wait for something to happen. Usually you can write much more efficient tests by waiting for something specific to happen, like an element appearing in the DOM.


## Compatibility


## See Also

* until.element
* until.execute


## Dalek 0.0.x Reference

* Docs: http://dalekjs.com/docs/actions.html#meth-wait
* Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/actions.js#L466-L504

```js
test.wait(10000);
```

*/

module.exports = function(dalek) {
  var format = dalek.format;

  // plugin meta data
  var meta = {
    // group to sort the plugin into
    namespace: 'until',
    // name of the plugin
    name: 'timeout',
    // allow calls like assert.click('.some-thing')
    signature: ['timeout'],
    // list of properties that must be specified at the very least
    required: ['timeout'],
    // disable the automatic timeout
    timeout: false,
  };

  var handler = function(options) {
    // the name invocations of this plugin will show up as
    var label = 'Waiting for ' + format.literal(options.timeout) + 'ms';

    // we're creating an action, give dalek that context
    var handle = new dalek.Handle(label, dalek.Handle.UNTIL, meta.name);

    setTimeout(function() {
      handle.resolve('timeout passed');
    }, options.timeout);

    return handle;
  };

  // register plugin
  dalek.registerPlugin(meta, handler);
};
