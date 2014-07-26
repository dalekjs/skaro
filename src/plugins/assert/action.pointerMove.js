// Status: NEW
// Category: Pointer
// Docs: -
// Source: -
// WIRE: https://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/moveto
// Note: Implemented in old Dalek but not documented 

action.pointerMove({
  selector: '#foo .bar', // OPTIONAL (HTML default if omitted)
  offset: [x, y] // OPTIONAL relative to the top-left corner of the element. If not specified, the mouse will move to the middle of the element.
})