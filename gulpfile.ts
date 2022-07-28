const gulp = require('gulp');
const stripDebug = require('gulp-strip-debug');

gulp.task(
  'strip-debug',
  () =>
    gulp
      .src(['.src/**.ts', './src/**.tsx']) // input file path
      .pipe(stripDebug()) // execute gulp-strip-debug
      .pipe(gulp.dest('.src/')) // output file path
);
