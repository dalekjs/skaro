// Status: IMPORTED
// Docs: http://dalekjs.com/docs/actions.html#meth-toFrame
// Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/actions.js#L180-L223
// Docs: http://dalekjs.com/docs/actions.html#meth-toParent
// Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/actions.js#L225-L257

  .toFrame('#login')
    .assert.title().is('Title of a page that can be embedded as an iframe')
  .toParent()

// --------------------------------------------------------------------------------------

action.frame('#id-of-frame', function(dalek_file_signature) {
  return [
    'commands-performed-in-frame'
  ];
});