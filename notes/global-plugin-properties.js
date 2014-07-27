module.exports = function (dalek, assert, action, wait) {
  return [

    until.visible({
      // specifiy which selector engine should be used
      // value: string or instance of Selector ("css" "xpath" "sizzle")
      // if string was given, resolve it agains dalek.options.selectorStrategy
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
      match: function(element, index, list) {
        // if match is a function, the plugin will not
        // execute webdriver.queryElements() but wrap this
        // method in a querySelectorAll().filter(_matchCallback_)
        return true;
      },

      // number of millicseconds to wait before aborting the method
      // default: dalek.options.timeout
      timeout: 5000,

      // number of times to retry when timeout reached
      // this can be used for lower timeouts that will simply
      // log a warning instead of failing
      // default: 0
      retry: 1,

      // log message for failure case
      message: 'width did not animate',

    }

  ];
};
