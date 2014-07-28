/*
    Formatting output is up to the reporter.
    HTML will require different handling than the console or a plaintext log file.
    Format is not supposed to actually format the output, but markup certain pieces
    of a string so they can be styles by the reporter later on.
 */

module.exports = function(dalek) {
  'use strict';

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
      token = new dalek.Selector(token);
    }

    return '{' + token.strategy + '} »' + token.text + '«';
  };

  Format.prototype.index = function(token) {
    return '{' + token + '}';
  };

  Format.prototype.expected = function(expected) {
    // TODO: expected function's displayName
    return expected.displayName || '##expected.displayName##';
  };

  return Format;
};
