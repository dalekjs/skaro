// Status: NEW
// Docs: -
// Source: -
// WIRE: https://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/orientation

assert.orientation({
  expected: 'landscape|portrait',
  message: 'Orientation as expected'
})