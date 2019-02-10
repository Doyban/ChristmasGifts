var gulp = require('gulp');

// Include plugins.
var jshint = require('gulp-jshint');
var imagemin = require('gulp-imagemin');
var minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync').create();

var reload = browserSync.reload;

// Reload browser on changes in development mode.
gulp.task('serve-dev', [], function () {
  browserSync.init({
    server: './app'
  });

  gulp.watch('./app/css/*.css').on('change', reload);
  gulp.watch('./app/js/*.js').on('change', reload);
  gulp.watch('./app/*.html').on('change', reload);
});

// Reload browser on changes in distribution mode.
gulp.task('serve-dist', [], function () {
  browserSync.init({
    server: './dist'
  });
});

// Use JSHint.
gulp.task('jshint', function() {
  gulp.src(['./app/js/*.js', '!./app/js/phaser.min.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Copy audio into destination directory.
gulp.task('copy-audio', function () {
  gulp.src('./app/assets/audio/**/*')
    .pipe(gulp.dest('./dist/assets/audio'));
});

// Copy other files into destination directory.
gulp.task('copy-others', function () {
  // Those 2 .json files for Messenger.
  gulp.src(['./app/index.html', './app/config.template.json', './app/fbapp-config.json'])
    .pipe(gulp.dest('./dist'));
});

// Minify CSS code.
gulp.task('minify-css', function() {
  gulp.src('./app/css/**/*.css')
    .pipe(minifyCSS({keepBreaks: true}))
    .pipe(gulp.dest('./dist/css'))
});

// Uglify JavaScript code.
gulp.task('compress', function() {
  return gulp.src('./app/js/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js'))
});

// Minify images.
gulp.task('compress-images', function() {
  return gulp.src(['./app/assets/**/*', '!./app/assets/xcf']) // source in pre-images folder, match all images
    .pipe(imagemin({ optimizationLevel: 7 }))
    .pipe(gulp.dest('./dist/assets'));
});

gulp.task('default', ['serve-dev']); // Default task.
gulp.task('dist', ['copy-audio', 'copy-others', 'minify-css', 'compress', 'compress-images']); // Distribution tasks.
