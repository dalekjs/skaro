'use strict';
/**
{
  category: 'browser'
}

# Name Of Plugin

Description Of Plugin


## Examples

```js
browser.frame('#id-of-frame', function(dalek_file_signature) {
  return [
    'commands-performed-in-frame'
  ];
});
```


## Notes


## Compatibility


## See Also


## Dalek 0.0.x Reference

* Docs: http://dalekjs.com/docs/actions.html#meth-toFrame
* Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/actions.js#L180-L223
* Docs: http://dalekjs.com/docs/actions.html#meth-toParent
* Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/actions.js#L225-L257

```js
test.toFrame('#login')
  .assert.title().is('Title of a page that can be embedded as an iframe')
.toParent();
```

*/

module.exports = function(/*dalek*/) {
  // TODO: implement plugin browser.frame
};
