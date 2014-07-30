var gulp = require('gulp');


gulp.task('test', function () {
  var fs = require('fs');
  var mocha = require('gulp-mocha');
  var cover = require('gulp-coverage');

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

gulp.task('lint', function() {
  var jshint = require('gulp-jshint');
  return gulp.src('{./src/*.js,./src/core/*.js,./src/util/*.js,./test/**/*.js}')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
    //.pipe(jshint.reporter('fail'))
});

gulp.task('lint-plugins', function() {
  var jshint = require('gulp-jshint');
  return gulp.src('{./src/plugins/is/*.js,./src/plugins/assert/assert.attribute.js,./src/plugins/action/action.click.js,./src/plugins/until/until.timeout.js}')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
    //.pipe(jshint.reporter('fail'))
});
