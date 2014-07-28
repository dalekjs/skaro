module.exports = function (dalek, assert, action, wait) {
  // plugin meta data
  var meta = {
    // allow calls like assert.attribute('.some-thing', 'attr-name', 'expected-value')
    signature: ['selector', 'name', 'expected'],
    // list of properties that must be specified at the very least
    required: ['selector', 'name'],
    // mark this plugin capable of handling {match: "all"}
    iterator: true,
    // mark this plugin as capable of handling .not.attribute()
    invertable: true,
  };
};
