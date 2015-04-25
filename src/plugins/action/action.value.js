'use strict';
/**
{
  category: 'keyboard'
}

# Set value property

Set a DOM element's value property


## Examples

```js
// compact notation
action.value('.selector', 'text');
// option notation
action.value({
  selector: '.selector',
  value: 'text'
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
  var format = dalek.format;

  // plugin meta data
  var meta = {
    // group to sort the plugin into
    namespace: 'action',
    // name of the plugin
    name: 'value',
    // allow calls like action.value('.some-thing', 'some value')
    signature: ['selector', 'value'],
    // list of properties that must be specified at the very least
    required: ['selector', 'value'],
    // mark this plugin capable of handling {match: "all"}
    iterator: true
  };

  var handler = function(options) {
    // the name invocations of this plugin will show up as
    var label = 'set value ' + format.literal(options.value) + ' on ' + format.selector(options.selector);
    // we're creating an action, give dalek that context
    var handle = new dalek.Handle(label, dalek.Handle.ACTION, meta.name);

    // JavaScript function that will be executed within the browser scope
    var setValueInBrowser = function (element, value) {
      element.value = value;
      return element;
    };

    var verify = function(values) {
      handle.resolveItems(values.length);
    };

    var trigger = function(elements) {
      return dalek.Q.all(elements.map(function(element) {
        return dalek.wd.execute(setValueInBrowser, [
          { ELEMENT: element },
          options.value
        ]);
      }));
    };

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
