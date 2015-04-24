/**
{
  category: 'navigation'
}

# Name Of Plugin

Description Of Plugin


## Examples

```js
browser.open('http://dalekjs.com')
```


## Notes


## Compatibility


## See Also


## Dalek 0.0.x Reference

* Docs: http://dalekjs.com/docs/actions.html#meth-open
* Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/actions.js#L668-L697

```js
test.open('http://dalekjs.com');
```

*/

module.exports = function(dalek) {
  var format = dalek.format;

  // plugin meta data
  var meta = {
    // group to sort the plugin into
    namespace: 'browser',
    // name of the plugin
    name: 'open',
    // allow calls like browser.open('.some-thing')
    signature: ['url'],
    // list of properties that must be specified at the very least
    required: ['url']
  };

  var handler = function(options) {
    // human readable name of what is supposed to happen
    var label = 'open url ' + format.literal(options.url);
    // we're creating an action, give dalek that context
    var handle = new dalek.Handle(label, dalek.Handle.ACTION, meta.name);

    var handleResponse = function(url) {
      // if a domain could not be resolved, browser's default to about:blank
      if (!url || (url === 'about:blank' && url !== options.url)) {
        handle.reject('could not open url, saw ' + format.literal(url) + ' instead');
        return;
      }

      handle.resolve('opened ' + format.literal(url));
    };

    dalek.wd
      // open URL
      .get(options.url)
      // query open URL
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
