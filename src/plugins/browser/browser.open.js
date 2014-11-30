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
  var driver = dalek.driver;

  // plugin meta data
  var meta = {
    // group to sort the plugin into
    namespace: 'browser',
    // name of the plugin
    name: 'open',
    // allow calls like assert.click('.some-thing')
    signature: ['url'],
    // list of properties that must be specified at the very least
    required: ['url']
  };

  var handler = function(options) {
    // the name invocations of this plugin will show up as
    var label = format.keyword(meta.name) + ' url ' + format.literal(options.url);

    // we're creating an action, give dalek that context
    var handle = new dalek.Handle(label, dalek.Handle.BROWSER, meta.name);

    // data we need to pass to WebDriver
    var data = {
      url: options.url
    };

    var handleResults = function(err) {
      if (!!err) {
          handle.rejectWithMessage(err, options.message, result);
          return true;
      }

      handle.resolveNavigation(options.url);
    };

    // talk to WebDriver
    driver.wd.get(options.url).then(
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
