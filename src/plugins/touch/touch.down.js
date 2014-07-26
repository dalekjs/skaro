// Status: NEW
// Category: Touch
// Docs: -
// Source: -
// WIRE: https://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/touch/down

touch.down({
  selector: '#foo .bar', // OPTIONAL (HTML default if omitted)
  offset: [x, y] // OPTIONAL relative to the top-left corner of the element. If not specified, the finger will point to the middle of the element.
})