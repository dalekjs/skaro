var gulp = require('gulp');


gulp.task('test', function () {
  var fs = require('fs');
  var mocha = require('gulp-mocha');
  var cover = require('gulp-coverage');

  try {
    fs.mkdirSync('./report')
  } catch (e) {}

  return gulp.src('./test/**/*.test.js', {read: false})
    // .pipe(cover.instrument({
    //   pattern: ['./src/**'],
    //   debugDirectory: 'debug'
    // }))
    .pipe(mocha({reporter: 'spec'}))
    // .pipe(cover.report({
    //   outFile: 'report/coverage.html'
    // }));
});

gulp.task('lint', function() {
  var jshint = require('gulp-jshint');
  return gulp.src('./{src,test,example,bin}/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
    //.pipe(jshint.reporter('fail'))
});
