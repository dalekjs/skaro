// Status: IMPORTED
// Docs: http://dalekjs.com/docs/assertions.html#meth-attr
// Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/assertions.js#L1294-L1368


test.assert.attr('.jumpButton', 'type', 'submit')

// --------------------------------------------------------------------------------------

assert.attribute({
  selector: '.jumpButton', 
  name: 'type',
  expected: 'submit'
}),
