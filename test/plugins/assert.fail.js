'use strict';

// NOTE: this assertion is for integrity testing only

module.exports = function(dalek) {
  var meta = {
    namespace: 'assert',
    name: 'fail',
    signature: [],
    required: [],
  };
  dalek.registerPlugin(meta, function(options) {
    var handle = new dalek.Handle("Failing Assertion", dalek.Handle.ASSERTION, "fail");
    handle.reject("failure");
    return handle;
  });
};
