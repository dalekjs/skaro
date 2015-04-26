'use strict';

// NOTE: this assertion is for integrity testing only

module.exports = function(dalek) {
  var meta = {
    namespace: 'assert',
    name: 'pass',
    signature: [],
    required: [],
  };
  dalek.registerPlugin(meta, function(options) {
    var handle = new dalek.Handle("Passing Assertion", dalek.Handle.ASSERTION, "pass");
    handle.resolve("success");
    return handle;
  });
  
};
