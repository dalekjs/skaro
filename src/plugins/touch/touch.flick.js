// Status: NEW
// Category: Touch
// Docs: -
// Source: -
// WIRE: https://code.google.com/p/selenium/wiki/JsonWireProtocol#session/:sessionId/touch/flick

touch.flick({
  selector: '#foo .bar', // OPTIONAL (HTML default if omitted)
  offset: [x, y], // The offset of pixels to flick by
  speed: 100 // OPTIONAL pixels per seconds
})