/**
{
  category: 'navigation'
}

# Browser Open URL

Tell the browser to open an URL.


## Examples

```js
// compact notation
browser.open('http://dalekjs.com')
// option notation
browser.open({
  url: 'http://dalekjs.com'
})
```


## Notes

If the browser can't resolve the host the action fails.
However opening the url `http://example.com` does not mean *that* URL is the one the browser lands on.
An HTTP redirect could have forwarded to `http://example.com/entry-point.html`, or JavaScript could've
altered the URL to `http://example.com/#some-anchor`. To verify what URL is currently displayed by the
browser use [assert.url](#plugin.assert.url).


## Compatibility

The URL browsers redirect to when they can't resolve a host varies:

* PhantomJS: `about:blank`
* Chrome: `data:text/html,chromewebdata`

*When* the browser considers a page loaded is not defined and thus varies from browser to browser - [#4: make resolution consistent across browsers](https://github.com/dalekjs/skaro/issues/4)

## See Also


## Dalek 0.0.x Reference

* Docs: http://dalekjs.com/docs/actions.html#meth-open
* Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/actions.js#L668-L697

```js
test.open('http://dalekjs.com');
```

*/

module.exports = function(dalek) {
  var URL = require('url');
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
    var label = 'open URL ' + format.link(options.url);
    // we're creating an action, give dalek that context
    var handle = new dalek.Handle(label, dalek.Handle.ACTION, meta.name);

    var notFoundRedirect = dalek.driver.capability && dalek.driver.capability['POST :sessionId/url hostNotFoundRedirect'];
    var notFoundUrl = dalek.driver.capability && dalek.driver.capability['POST :sessionId/url hostNotFoundUrl'];
    var previousUrl = null;

    var hostNotFound = function(requested, resolved) {
      if (!resolved) {
        return true;
      }

      if (requested === resolved || !notFoundUrl) {
        return false;
      }

      // some drivers don't change the document's location if the target URL can't be resolved,
      // so we check where we came from, where we wanted to go, and where we ended up
      var _previous = URL.parse(previousUrl);
      var _requested = URL.parse(requested);
      var _resolved = URL.parse(resolved);
      return resolved === notFoundUrl
        // if we wanted to go to another host, but remained on the same host, we likely hit an host resolution error
        // NOTE: this could break tests involving forwarding to another host
        || (!notFoundRedirect && _previous.hostname !== _requested.hostname && _resolved.hostname === _previous.hostname);
    };

    var verify = function(url) {
      if (hostNotFound(options.url, url)) {
        handle.reject('could not open url, saw ' + format.link(url) + ' instead');
        return;
      }

      handle.resolve('opened ' + format.link(url));
    };

    dalek.wd
      // obtain the URL we started from to later check if we ever left
      .url().then(function(url){ previousUrl = url; })
      // opening URL never fails
      .get(options.url)
      // so query current URL
      .url()
      // to verify we're somewhere
      .then(verify, handle.reject)
      // instead of .done() we inform dalek when something went terribly wrong
      .catch(dalek.catch);

    return handle;
  };

  // register plugin
  dalek.registerPlugin(meta, handler);
};
