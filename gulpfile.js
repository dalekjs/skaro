var gulp = require('gulp');
var mocha = require('gulp-mocha');
var cover = require('gulp-coverage');
var fs = require('fs');

gulp.task('test', function () {
  try {
    fs.mkdirSync('./report')
  } catch (e) {}
  
  return gulp.src('test/*js', {read: false})
    .pipe(cover.instrument({
      pattern: ['./src/**'],
      debugDirectory: 'debug'
    }))
    .pipe(mocha({reporter: 'spec'}))
    .pipe(cover.report({
      outFile: 'report/coverage.html'
    }));
});