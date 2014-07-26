/*
 * SELECTOR STRATEGY
 * MicroSyntax to allow a more convenient strategy specification
 */
function Selector(type, text) {
  this.type = type;
  this.text = text;
};

Object.defineProperty(String.prototype, 'xpath', {
  enumerable: false,
  configurable: false,
  get: function() {
    this.selectorStrategy = 'xpath'; 
    return new Selector('xpath', this + "");
  }
});

/*
 * PROPERTY SELECTOR SYNTAX
 * MicroSyntax to allow a more convenient property/event specification
 * look at http://dev.w3.org/csswg/selectors-nonelement/
 */
function propertySelector(text) {
  var p = text.split(' ');
  return {
    property: p[0],
    selector: p.slice(1).join(' ')
  };
}
