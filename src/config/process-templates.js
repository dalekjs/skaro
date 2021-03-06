'use strict';

var _ = require('lodash');

function processValue(name, value, data) {
  try {
    return _.template(value, data);
  } catch (reason) {
    throw {
      name: name,
      value: value,
      reason: reason
    };
  }
}

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
    var _data = {};
    Object.keys(value).forEach(function(key) {
      var _value = value[key];
      var processedValue = processTemplates(name, _value, data, _path);
      _data[key] = processedValue;
    });
    return _data;
  }

  if (_type !== 'string') {
    return value;
  }

  return processValue(name, value, data);
}

module.exports = processTemplates;
