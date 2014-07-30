'use strict';
/**
{
  category: 'pointer'
}

# Name Of Plugin

Description Of Plugin


## Examples

```js
pointer.drag({
  selector: '.selector', // OPTIONAL (HTML default if omitted)
  offset: [x, y] // OPTIONAL relative to the top-left corner of the element. If not specified, the mouse will move to the middle of the element.
  dropAreaSelector: '#bar .foo',
  dropAreaOffset: 'middle center'
});
```


## Notes


## Compatibility


## See Also

* WIRE: https://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/moveto


## Dalek 0.0.x Reference

Not Available (Implemented, but not documented)

*/

module.exports = function(/*dalek*/) {
  // TODO: implement plugin pointer.drag
  // Check the possibility of `offset` also accepting a string:
  // `middle center`, `left top`, etc.

  // SUPER METHOD
  // combines down & up into one method call  
};
