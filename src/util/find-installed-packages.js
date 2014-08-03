'use strict';
/*
    Searches for all installed (and loadable by require()) packages matching a given filter

    locally installed modules are read from node_modules
    (located somewhere in the ancestry of a given path or CWD)

    globally installed modules are read from the global folders
    http://nodejs.org/api/modules.html#modules_loading_from_the_global_folders
    (including anything in $NODE_PATH)

    Note: This bundle could've used https://www.npmjs.org/package/read-installed but
    then it would've read *all* packages instead of only the ones we filter for
 */

var fs = require('fs');
var path = require('path');
var globalPaths = require('module').Module.globalPaths.slice(0);

var Q = require('q');
var readPackageJson = require('read-package-json');
var findFileInParents = require('./find-file-in-parents.js');

var readdir = Q.denodeify(fs.readdir);
var lstat = Q.denodeify(fs.lstat);
var readJson = Q.denodeify(readPackageJson);

function filterDotFiles(basename) {
  return basename.charAt(0) !== '.';
}

function filterEmpty(basename) {
  return !!basename;
}

function listDirectories(_path) {
  return readdir(_path).then(function(data) {
    return data.filter(filterDotFiles);
  });
}

function findGlobalPaths() {
  return Q.allSettled(globalPaths.filter(filterDotFiles).filter(filterEmpty).map(function(base) {
    return lstat(base).thenResolve(base);
  })).then(function(promises) {
    // now that all paths have been tested,
    // return only the ones that actually exist
    return promises.filter(function(promise) {
      return promise.state === 'fulfilled';
    }).map(function(promise) {
      return promise.value;
    });
  });
}

function readInstalledPackages(dirname, filter) {
  return listDirectories(dirname).then(function(paths) {
    return Q.all(paths.filter(filter).map(function(basename) {
      return readJson(path.resolve(dirname, basename, 'package.json'), false).then(function(data) {
        data.__directory = dirname;
        return data;
      });
    }));
  });
}

function findInstalledPackages(filter, cwd) {
  // right curry, anyone?
  var findPackages = function(dirname) {
    return readInstalledPackages(dirname, filter);
  };

  return Q.all([
    findFileInParents('node_modules', cwd || process.cwd()).then(findPackages),
    findGlobalPaths().then(function(paths) {
      return Q.all(paths.map(function(base) {
        return findPackages(base);
      })).then(function(data) {
        // flatten array in array to array
        return data.reduce(function(previous, current) {
          return previous.concat(current);
        }, []);
      });
    })
  ]).then(function(data) {
    // do not make me use .spread()
    return {
      local: data[0],
      global: data[1]
    };
  });
}

module.exports = findInstalledPackages;
