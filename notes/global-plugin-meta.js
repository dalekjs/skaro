module.exports = function (dalek, assert, action, wait) {
  // plugin meta data
  var meta = {
    // group to sort the plugin into
    // default groups are: assert, action, until
    namespace: 'assert',
    // name of the plugin
    name: 'something',
    // allow calls like assert.attribute('.some-thing', 'attr-name', 'expected-value')
    signature: ['selector', 'name', 'expected'],
    // list of properties that must be specified at the very least
    required: ['selector', 'name'],
    // mark this plugin capable of handling {match: "all"}
    iterator: true,
    // mark this plugin as capable of handling .not.attribute()
    invertable: true,
    // disable the automatic timeout
    timeout: false,


    // --- Expectation specific ---

    // provide a meaningful name for an expectation to show up in logs and reports
    displayName: 'is.green'
    displayName: function(options) {
      return 'color equals ' + dalek.format.literal(options.expected);
    },  
  };
};
