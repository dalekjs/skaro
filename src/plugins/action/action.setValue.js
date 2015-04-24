'use strict';
/**
{
  category: 'keyboard'
}

# Name Of Plugin

Description Of Plugin


## Examples

```js
// compact notation
action.setValue('.selector', 'text');
// option notation
action.setValue({
  selector: '.selector',
  text: 'text'
});
```


## Notes

* This changes the value property of the DOM element, not the `value` attribute.
* No events (`keydown`, … `change`, `input`) are dispatched.


## Compatibility


## See Also


## Dalek 0.0.x Reference

* Docs: http://dalekjs.com/docs/actions.html#meth-setValue
* Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/actions.js#L1122-L1153

```js
test.setValue('#ijustwannahaveavalue', 'a value');
```

*/

module.exports = function(dalek) {
  var format = dalek.format;;

  // plugin meta data
  var meta = {
    // group to sort the plugin into
    namespace: 'action',
    // name of the plugin
    name: 'setValue',
    // allow calls like action.setValue('.some-thing', 'some value')
    signature: ['selector', 'value'],
    // list of properties that must be specified at the very least
    required: ['selector', 'value'],
    // mark this plugin capable of handling {match: "all"}
    iterator: true
  };

  var handler = function(options) {
    // the name invocations of this plugin will show up as
    var label = 'setValue ' + format.expected(options.selector) + ' on ' + format.selector(options.selector);

    // we're creating an action, give dalek that context
    var handle = new dalek.Handle(label, dalek.Handle.ACTION, meta.name);
    // data we need to pass to WebDriver
    var data = {
      selector: options.selector,
      value: options.value
    };

    var handleResults = function(items) {
      // all elements were clicked on, if handle was rejected,
      // this call is ignored by the Promise
      handle.resolveItems(items.length);
    };

    // JavaScript function that will be executed within the browser scope
    var setValueInBrowserScope = function (element, value) {
      element.value = value;
      return element;
    };

    var performSetValue = function (elements) {
      // talk to WebDriver
      // collect the attribute information from all matched elements
      var deferreds = [];
      elements.forEach(function (element) {
        deferreds.push(dalek.wd.execute(setValueInBrowserScope, [{ELEMENT: element}, data.value]));
      });

      // process results when all element attribute values have been collected
      dalek.Q.all(deferreds).then(
        // process WebDriver results
        handleResults.bind(this, elements),
        // WebDriver rejects on empty selector-result with string
        // any errors (including malformed selector) with DalekError
        handle.reject
      ).catch(dalek.catch);
    };

    dalek.wd.matchElements(options).then(
      performSetValue,
      // WebDriver rejects on empty selector-result with string
      // any errors (including malformed selector) with DalekError
      handle.reject
    ).catch(dalek.catch);

    return handle;
  };

  // register plugin
  dalek.registerPlugin(meta, handler);
};
