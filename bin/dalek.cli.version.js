module.exports = function() {
  'use strict';

  var childProcess = require('child_process');
  var chalk = require('chalk');
  var Q = require('q');
  var packageMeta = require('../package.json');

  function executeToJSON(command) {
    var deferred = Q.defer();
    childProcess.exec(command, function(err, stdout/*, stderr*/) {
      // need to disable error handling, because npm is trying to be over-helpful here:
      // npm ERR! extraneous: matchdep@0.3.0 /Users/rrehm/Projekte/test.dev/htdocs/dalekjs/skaro/node_modules/matchdep
      // npm ERR! not ok code 0 
      // if (err) {
      //   deferred.reject(err);
      // }

      deferred.resolve(JSON.parse(stdout));
    });

    return deferred.promise;
  }

  function filterDalek(installed) {
    return Object.keys(installed.dependencies).filter(function(key) {
      return key.slice(0, 6) === 'dalek-';
    }).map(function(key) {
      return '    ' + chalk.bgBlack.cyan(key) + ' ' + chalk.bgBlack.yellow('@' + installed.dependencies[key].version);
    }).join('\n');
  }


  console.log('\n' + chalk.bgBlack.cyan(packageMeta.name), 'version', chalk.bgBlack.yellow(packageMeta.version) + '\n');
  if (packageMeta.description) {
    console.log(packageMeta.description + '\n');
  }

  Q.all([
    // globally installed packages
    executeToJSON('npm ls -g --json --depth 0').then(filterDalek),
    // locally installed packages
    executeToJSON('npm ls --json --depth 0').then(filterDalek),
  ]).spread(function (_global, _local) {
    console.log('  globally installed Dalek packages');
    console.log(_global);

    console.log('\n  locally installed Dalek packages');
    console.log(_local);
  }).done();

};
