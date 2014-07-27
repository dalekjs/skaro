// Status: NEW
// Docs: -
// Source: -
// WIRE: https://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/moveto
// Note: Implemented in old Dalek but not documented

// Check the possibility of `offset` also accepting a string:
// `middle center`, `left top`, etc.

// SUPER METHOD
// combines down & up into one method call

pointer.drag({
  selector: '#foo .bar', // OPTIONAL (HTML default if omitted)
  offset: [x, y] // OPTIONAL relative to the top-left corner of the element. If not specified, the mouse will move to the middle of the element.
  dropAreaSelector: '#bar .foo',
  dropAreaOffset: 'middle center'
})