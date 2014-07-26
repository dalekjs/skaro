// Status: IMPORTED
// Category: Script
// Docs: http://dalekjs.com/docs/actions.html#meth-execute
// Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/actions.js#L820-L857


test.execute(function (paramFoo, aBar) {
  window.myFramework.addRow(paramFoo);
  window.myFramework.addRow(aBar);
}, 'foo', 'bar')

// --------------------------------------------------------------------------------------

browser.execute(function() {

})

