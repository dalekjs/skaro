module.exports = function() {
  'use strict';

  var chalk = require('chalk');
  var findInstalledPackages = require('../src/util/find-installed-packages');
  var packageMeta = require('../package.json');

  function filterDalek(packageName) {
    return packageName.slice(0, 5) === 'dalek';
  }

  console.log('\n' + chalk.bgBlack.cyan(packageMeta.name), 'version', chalk.bgBlack.yellow(packageMeta.version) + '\n');
  if (packageMeta.description) {
    console.log(packageMeta.description + '\n');
  }

  findInstalledPackages(filterDalek).then(function(packages) {
    console.log('  locally installed Dalek packages');
    packages.local.forEach(function(item) {
      console.log('    ' + chalk.bgBlack.cyan(item.name) + ' ' + chalk.bgBlack.yellow('@' + item.version));
    });

    console.log('\n  globally installed Dalek packages');
    packages.global.forEach(function(item) {
      console.log('    ' + chalk.bgBlack.cyan(item.name) + ' ' + chalk.bgBlack.yellow('@' + item.version) + ' in ' + item.__directory);
    });

    console.log('\n  loadable packages');
    Object.keys(packages.map).sort().forEach(function(key) {
      var item = packages.map[key];
      console.log('    ' + chalk.bgBlack.cyan(item.name) + ' ' + chalk.bgBlack.yellow('@' + item.version) + ' in ' + item.__directory);
    });
  }).done();

};
