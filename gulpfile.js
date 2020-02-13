const gulp = require('gulp');
const noop = require('gulp-noop');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const mergeStream = require('merge-stream');
const browserSync = require('browser-sync');
const del = require('del');
const { argv } = require('yargs');

gulp.task('clean', () => del('dist/**/*'));

gulp.task('build:css', () => {
  return gulp.src('src/slider.css')
    .pipe(maps('init'))
    .pipe(autoprefixer())
    .pipe(maps('write', '.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('build:js', () => {
  return gulp.src([
    'src/util.js',
    'src/jquery.slider.js',
  ]).pipe(maps('init'))
    .pipe(concat('jquery.slider.js'))
    .pipe(maps('write', '.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('dev', gulp.series(
  'clean',
  'build:css',
  'build:js'
));

gulp.task('build', gulp.series('dev', () => {
  const stream1 = gulp.src('dist/slider.css')
    .pipe(maps('init'))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(maps('write', '.'))
    .pipe(gulp.dest('dist'));

  const stream2 = gulp.src('dist/jquery.slider.js')
    .pipe(maps('init'))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(maps('write', '.'))
    .pipe(gulp.dest('dist'));

  return mergeStream(stream1, stream2);
}));

gulp.task('watch', gulp.series('dev', () => {
  browserSync.init({
    open: false,
    notify: true,
    server: { baseDir: './' },
  });

  gulp.watch('**/*.html')
    .on('change', browserSync.reload);

  gulp.watch('src/**/*.css')
    .on('change', () => {
      return getTaskFn('build:css')
        .pipe(browserSync.reload({ stream: true }));
    });

  gulp.watch('src/**/*.js')
    .on('change', gulp.series('build:js'));
}));

function maps(method, ...args) {
  return argv.maps ? sourcemaps[method](...args) : noop();
}

function getTaskFn(taskName) {
  return gulp.registry().get(taskName).unwrap()();
}