module.exports = function(dalek, wd) {
  'use strict';

  /*
    convenienve WebDriver utility for resolving elements "the dalek way"

    wd.matchElements({
      selector: new Selector('.hello-world', 'css'),
      match: 'first',
    })

    selector: (instance of src/core/Selector.js)
      provides a simple interface to the various selector strategies,
      css, xpath, sizzle
      
  */

  var _ = dalek._;
  var Q = dalek.Q;

  function matchElementsFilter(options, elements) {
    if (!elements.length) {
      return Q.reject(new Error('No elements found'));
    }

    // we have to work with WD element references
    var _elements = _.pluck(elements, 'value');

    // check if an `index` is given, try to pull that element
    if (_.isNumber(options.match)) {
      if (_elements[options.match]) {
        return [_elements[options.match]];
      } else {
        return Q.reject(new Error('Match index "' + options.match + '" not found'));
      }
    }

    // filter first, last, all
    switch (options.match) {
      case 'first':
        return _elements.slice(0, 1);

      case 'last':
        return _elements.slice(-1);

      case 'any':
      case 'all':
        return _elements;

      default:
        return Q.reject(new Error('unkown match strategy "' + options.match + '"'));
    }
  }

  function matchElementsCallback(options, elements) {
    // WebDriver is inconsistent in the way it provides and receives nodes
    // while {value: <wdID>} is what comes out, {ELEMENT: <wdID>} is what goes in
    // see https://code.google.com/p/selenium/wiki/JsonWireProtocol#WebElement_JSON_Object
    var _elements = elements.map(function(element) {
      return { ELEMENT: element.value };
    });

    var executeMatchInBrowser = function(element, index, array) {
      // execute the match callback function for every element
      // see https://code.google.com/p/selenium/wiki/JsonWireProtocol#/session/:sessionId/execute
      return this.execute(options.match, [element, index, array]).then(function(valid) {
        element.valid = valid;
        return element;
      });
    }.bind(this);

    return Q.all(_elements.map(executeMatchInBrowser)).then(function(matches) {
      return matches.filter(function(element) {
        // remove whatever did not match
        return element.valid;
      }).map(function(element) {
        // we're dealing in references only
        return element.ELEMENT;
      });
    });
  }

  function matchElements(options) {

    if (options.selector.strategy === 'sizzle') {
      // TODO: implement selector strategy "sizzle"
      throw new Error('selector strategy "sizzle" not yet supported!');
    }

    var matcher = typeof options.match === 'function'
      ? matchElementsCallback
      : matchElementsFilter;

    // Load all elements & return them based on the `match` option
    return this.elements(
      options.selector.strategy,
      options.selector.text
    ).then(matcher.bind(this, options));
  };

  wd.addPromiseMethod('matchElements', matchElements);
};
