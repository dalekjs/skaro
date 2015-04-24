/*
    The Selector is a simple interface to allow basic selector mutation
    and differentiation between differen engines, like xpath, css, sizzle.
 */

module.exports = function(dalek) {
  'use strict';

  function Selector(text, strategy) {
    this.text = text;
    this.strategy = strategy || 'css';

    if (Selector.strategies[this.strategy]) {
      this.strategy = Selector.strategies[this.strategy]
    }

    if (Selector._strategies.indexOf(this.strategy) === -1) {
      throw new dalek.Error('Unknown strategy »' + this.strategy + '« for selector »' + this.text + '«');
    }
  }

  Selector.strategies = {
    'css': 'css',
    'xpath': 'xpath',
    'id': 'id',
    'name': 'name',
    'tagName': 'tag name',
    'className': 'class name',
    'linkText': 'link text',
    'partialLinkText': 'partial link text',
    // custom Dalek thing
    'sizzle': 'sizzle'
  };

  Selector._strategies = Object.keys(Selector.strategies).map(function(key) {
    return Selector.strategies[key];
  });

  // MicroSyntax to allow a more convenient property/event specification
  // "property .selector" as used by Backbone
  // look at http://dev.w3.org/csswg/selectors-nonelement/
  Selector.prototype.property = function() {
    if (this.strategy !== 'css') {
      return null;
    }

    var p = this.text.split(' ');
    this.property = p[0];
    this.text = p.slice(1).join(' ');

    return this.property;
  };

  Selector.prototype.valueOf = function() {
    return this.text;
  };

  Selector.prototype.toString = function() {
    return this.text;
  };

  // TODO: reconsider if modifying String.prototype is such a good idea
  // allow: "foo".xpath
  // equivalend to: new Selector("foo", "xpath")
  Object.keys(Selector.strategies).forEach(function(strategy) {
    if (String.prototype[strategy]) {
      // FIXME: core/Selector needs to lose dalek dependency as it binds itself to the global String!
      return;
    }

    Object.defineProperty(String.prototype, strategy, {
      enumerable: false,
      configurable: false,
      get: function() {
        return new Selector(String(this), Selector.strategies[strategy]);
      }
    });
  });

  return Selector;
};
