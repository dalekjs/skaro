module.exports = function(dalek) {

  function Selector(text, strategy) {
    this.text = text;
    this.strategy = strategy || 'css';

    if (Selector.strategies.indexOf(this.strategy) === -1) {
      throw new dalek.Error('Unknown strategy »' + this.strategy + '« for selector »' + this.text + '«');
    }
  };

  Selector.strategies = ['css', 'xpath', 'sizzle'];

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

  // allow: "foo".xpath
  // equivalend to: new Selector("foo", "xpath")
  Selector.strategies.forEach(function(strategy) {
    Object.defineProperty(String.prototype, strategy, {
      enumerable: false,
      configurable: false,
      get: function() {
        return new Selector(strategy, this + "");
      }
    });
  });

  return Selector;
};
