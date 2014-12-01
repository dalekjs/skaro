'use strict';
/**
{
  category: 'pointer'
}

# Click On A DOM element

Click on a DOM element at the center of it's shape using the left mouse button. For more control over the actual click see the [pointer] actions.


## Examples

```js
// compact notation
action.click('.selector');
// option notation
action.click({
  selector: '.selector'
});
```


## Notes


## Compatibility

// TODO: browser incompatibility notes should be extracted from the dalek-driver-* repositories
***Warning*** Does not work correctly in Firefox when used on <select> and <option> elements


## See Also

* pointer.doubleClick
* pointer.down
* pointer.drag
* pointer.move
* pointer.up


## Dalek 0.0.x Reference

* Docs: http://dalekjs.com/docs/actions.html#meth-click
* Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/actions.js#L585-L629

```js
test.click('#faq');
```

*/

module.exports = function(dalek) {
  var format = dalek.format;
  var driver = dalek.driver;

  // plugin meta data
  var meta = {
    // group to sort the plugin into
    namespace: 'action',
    // name of the plugin
    name: 'click',
    // allow calls like assert.click('.some-thing')
    signature: ['selector'],
    // list of properties that must be specified at the very least
    required: ['selector'],
    // mark this plugin capable of handling {match: "all"}
    iterator: false
  };

  var handler = function(options) {
    // the name invocations of this plugin will show up as
    var label = 'Click on ' + format.selector(options.selector);

    // we're creating an action, give dalek that context
    var handle = new dalek.Handle(label, dalek.Handle.ACTION, meta.name);
    // data we need to pass to WebDriver
    var data = {
      selector: options.selector
    };

    var handleResults = function() {
      // all elements were clicked on, if handle was rejected,
      // this call is ignored by the Promise
      handle.resolveItems(1);
    };

    var performClick = function (elements) {
      // talk to WebDriver
      driver.wd.click(elements[0]).then(
        // process WebDriver results
        handleResults,
        // WebDriver rejects on empty selector-result with string
        // any errors (including malformed selector) with DalekError
        handle.reject
      ).catch(dalek.catch);

    };

    driver.elements(options).then(
      performClick,
      // WebDriver rejects on empty selector-result with string
      // any errors (including malformed selector) with DalekError
      handle.reject
    ).catch(dalek.catch);

    return handle;
  };

  // register plugin
  dalek.registerPlugin(meta, handler);
};
