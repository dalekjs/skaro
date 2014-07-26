// Status: IMPORTED
// Category: Script
// Docs: http://dalekjs.com/docs/actions.html#meth-waitFor
// Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/actions.js#L859-L900


test.waitFor(function (aCheck) {
  return window.myThing === aCheck;
}, ['arg1', 'arg2'], 10000)

// --------------------------------------------------------------------------------------

until.execute(function() {

})

