
var Selector = require('./Selector');

// options.color boolean - disable color output
function Format(options) {
  this.options = options;
}

// attribute name, event name, that sort of stuff
Format.prototype.keyword = function(token) {
  return '»' + token + '«';
};

// values that we compare with
Format.prototype.literal = function(token) {
  if (typeof token === 'function') {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/displayName
    token = token.displayName || '@function@';
  } else if (typeof token === 'object') {
    token = '@object@';
  }

  return '»' + token + '«';
};

Format.prototype.selector = function(token) {
  if (typeof token === 'string') {
    token = new Selector(token);
  }

  return '{' + token.strategy + '} »' + token.text + '«';
};

Format.prototype.index = function(token) {
  return '{' + token + '}';
};

module.exports = Format;