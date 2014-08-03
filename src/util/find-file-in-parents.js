'use strict';
/*
    Searches for a given file in the given directory and all it's parents.

    findFileInParents('.git', '/home/is/where/my/data/lives');
    will test the following directories:
      /home/is/where/my/data/lives/.git
      /home/is/where/my/data/.git
      /home/is/where/my/.git
      /home/is/where/.git
      /home/is/.git
      /home/.git
      /.git
    and resolve the returned promise with the found path.
    If it cannot find a path, the promise is rejected.
 */

var fs = require('fs');
var path = require('path');
var Q = require('q');
var lstat = Q.denodeify(fs.lstat);

function findFileInParents(file, base) {
  if (base === undefined) {
    // start with the current working directory by default
    base = process.cwd();
  }

  var _path = path.resolve(base, file);
  return lstat(_path).thenResolve(_path).catch(function() {
    // TODO: windows compatible paths
    if (base === '/') {
      // we've reached root and found nothing, time to give up.
      return Q.reject();
    }

    // try the next parent directory
    return findFileInParents(file, path.resolve(base, '..'));
  });
}

module.exports = findFileInParents;
