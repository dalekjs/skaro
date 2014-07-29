module.exports = function (dalek, assert, action, wait) {
  return [

    until.visible({
      // specifiy which selector engine should be used
      // value: string or instance of Selector ("css" "xpath" "sizzle")
      // if string was given, resolve it agains dalek.options('selectorStrategy')
      // Dalek will always perform a querySelectorAll() like search for
      // elements and then reduce the selector-result according to "match"
      selector: '#some-selector'.css,

      // specifiy which element of the selector-result should be used
      // value: "first", "last", "all", 123, function
      // default: 'first'
      // "all" may not be supported by every plugin
      match: 'first',
      // filter callback for imperative element selection
      // function is executed in browser space
      // TODO: implement match: function(){}
      match: function(element, index, list) {
        // if match is a function, the plugin will not
        // execute webdriver.queryElements() but wrap this
        // method in a querySelectorAll().filter(_matchCallback_)
        return true;
      },

      // number of millicseconds to wait before aborting the method
      // default: dalek.options('timeout')
      timeout: 5000,

      // number of times to retry when timeout reached
      // this can be used for lower timeouts that will simply
      // log a warning instead of failing
      // default: 0
      // TODO: implement retry
      retry: 1,

      // log message for failure case,
      // overwrites the error-message returned by the an expected-callback of an assertion
      message: 'width did not animate',


      // --- Assertion and Expectation specific ---

      // specify the value an assertion is to validate against
      // value: anything but a function object is converted to is.equal(options.expected)
      // return: the function is to return a string (error message) in case of failure
      // and a falsy value (false, empty-string) in case of success,
      // example: function(value) { return value === 'foobar' ? '' : ('unexpected ' + dalek.format.literal(value)) }
      expected: '',

      // flag to make an assertion work the other way around,
      // if default would be to check === 'foo', the inverted
      // way is to !(check === 'foo')
      inverted: false,


      // --- Generated properties ---

      // call-stack at call-time (i.e. during suite/unit definition phase)
      // used internally to provide error messages that make sense
      called: [{ name: 'functionName', file: 'file.js', line: 123 }],

      // the arguments (as array) at call-time, this may be useful to plugins such as log.* 
      // where you want to allow log.message('key1', 'key2', 'key3')
      arguments: [],

    })
  ];
};
