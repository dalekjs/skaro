// Status: NEW
// Docs: -
// Source: -
// WIRE: https://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/element/:id/location

assert.position({
  selector: '#foo .bar',
  expected: [x, y], // Coordinates in pixels from the left-upper corner of the page
  threshold: [x1, x2, y1, y2], // MAYBE define a threshold instead of mostly useless exact values
  message: 'Element is positioned within a specific threshold'
})