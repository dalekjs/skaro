module.exports = function(config) {
  'use strict';

  console.log('--------------------------------');
  console.log('CLI Options: ');
  console.log(JSON.stringify(config._options, null, 2));
  console.log('--------------------------------');
  console.log('Configuration: ');
  console.log(JSON.stringify(config._config, null, 2));
  console.log('--------------------------------');
  console.log('Data: ');
  console.log(JSON.stringify(config._data, null, 2));
  console.log('--------------------------------');
  console.log('Resources: ');
  console.log(JSON.stringify(config._resources, null, 2));
  console.log('--------------------------------');

};