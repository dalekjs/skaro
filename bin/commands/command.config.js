module.exports = function(config/*, cli*/) {
  'use strict';

console.log(JSON.stringify(config._config, null, 2));

// parent-1, parent-2, parent-grand
// some: options 

var ConfigFile = require('../../src/config/ConfigFile');

console.log("\n\n --------------------------- \n\n")

var conf = new ConfigFile('/Users/rrehm/Projekte/test.dev/htdocs/dalekjs/skaro/example/Dalekfile.json', {
  cli: {}
});
console.log(conf);
console.log('---------------------------------------');

conf.load().then(function(_conf) {
  console.log(_conf);
  console.log('---------------------------------------');
  console.log(JSON.stringify(_conf.data(), null, 2));
  console.log('---------------------------------------');
  console.log(JSON.stringify(_conf.resources(), null, 2));
  console.log('---------------------------------------');

}).catch(function(e) {
  console.log(e);
});

};