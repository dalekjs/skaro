// Status: IMPORTED
// Docs: http://dalekjs.com/docs/actions.html#meth-toWindow
// Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/actions.js#L259-L297
// Docs: http://dalekjs.com/docs/actions.html#meth-toParentWindow
// Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/actions.js#L299-L331

.toWindow('goog')
  .assert.title().is('Google')
.toParentWindow()

// --------------------------------------------------------------------------------------

browser.window('name-of-window', function(dalek_file_signature) {
  return [
    'commands-performed-in-window'
  ];
});