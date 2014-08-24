'use strict';

var _ = require('lodash');

function processTemplates(name, value, data, _path) {
  if (!value) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(function(_value) {
      return processTemplates(name, _value, data, _path);
    });
  }

  var _type = typeof value;

  if (_type === 'object') {
    return Object.keys(value).map(function(key) {
      var _value = value[key];
      return processTemplates(name, _value, data, _path);
    });
  }

  if (_type !== 'string') {
    return value;
  }

  return processValue(name, value, data, _path);
}

function processValue(name, value, data, _path) {
  try {
    return _.template(value, data);
  } catch (reason) {
    throw {
      _message: 'Malformed value template',
      _code: 10, // Config.VALUE_TEMPLATE
      file: _path,
      error: reason,
      details: {
        name: name,
        value: value,
        message: reason.message,
      }
    };
  }
}

module.exports = processTemplates;
