'use strict';
/**
{
  category: 'pointer'
}

# Name Of Plugin

Description Of Plugin


## Examples

```js
pointer.up({
  selector: '.selector', // OPTIONAL (HTML default if omitted)
  offset: [x, y] // OPTIONAL relative to the top-left corner of the element. If not specified, the mouse will move to the middle of the element.
  button: 'left|middle|right' // OPTIONAL button to press, defaults to `left`
})
```


## Notes


## Compatibility


## See Also

* WIRE: https://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/moveto


## Dalek 0.0.x Reference

Not Available (Implemented, but not documented)

*/

module.exports = function(/*dalek*/) {
  // TODO: implement plugin pointer.up
  // Check the possibility of `offset` also accepting a string:
  // `middle center`, `left top`, etc.  
};
