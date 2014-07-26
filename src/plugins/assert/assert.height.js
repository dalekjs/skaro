// Status: IMPORTED
// Docs: http://dalekjs.com/docs/assertions.html#meth-height
// Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/assertions.js#L545-L587


test.assert.height('#fixed-dimensions', 100)

// --------------------------------------------------------------------------------------

assert.height('#fixed-dimensions')
assert.height('#fixed-dimensions', function(value) {
  return value > 100
})

