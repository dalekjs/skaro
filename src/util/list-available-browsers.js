module.exports = function(dalek) {
  'use strict';

  var installed = Object.keys(dalek.packages).filter(function(item) {
    return item.slice(0, 13) === 'dalek-driver-';
  }).map(function(item) {
    return item.slice(13);
  });

  var options = dalek.options();
  var configured = Object.keys(options).filter(function(item) {
    return item.slice(0, 8) === 'browser.';
  }).map(function(item) {
    return item.slice(8);
  });

  // TODO: add browser drivers installable through NPM

  var message = 'configured browsers:\n  ' + configured.sort().join('\n  ')
    + '\ninstalled browser drivers:\n  ' + installed.sort().join('\n  ');

  return message;
};