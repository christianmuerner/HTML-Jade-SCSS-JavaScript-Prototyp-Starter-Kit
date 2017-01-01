'use strict';
// load all install packages
var browserify = require('browserify');
var autoprefixer = require('gulp-autoprefixer');
var gulp = require('gulp');
var connect = require('gulp-connect-multi')();
var gulpif = require('gulp-if');
var jade = require('gulp-jade');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');

var env = process.env.NODE_ENV || 'development';
// NODE_ENV=production gulp TASK
var outputDirDevelopment = 'builds/development';
var outputDirProduction = 'builds/production';
var configPath = '' || outputDirDevelopment;
var sourceScript = '' || 'script.js';
if(env === 'development') {
  configPath = outputDirDevelopment;
  sourceScript = 'script.js';
} else if(env === 'production') {
  configPath = outputDirProduction;
  sourceScript = 'script.min.js';
}

// Jade template Engine
gulp.task('jade', function() {
  return gulp.src('src/templates/**/*.jade')
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(jade())
    // Error handling
    .on('error', notify.onError({
      title: "Error running Taks Jade",
      message: "Error: <%= error.message %>"
    }))
    .pipe(gulp.dest(configPath))
    .on('end', function(){ gutil.log('Templates generated!'); })
    .pipe(connect.reload());
});
// gulp jade
// NODE_ENV=production gulp jade

// Sass processing
gulp.task('javascript', function() {
  browserify({
    entries: 'src/js/main.js',
    debug: env === 'development'
  })
  .bundle()
  // Error handling
  .on('error', notify.onError({
    title: "Error running Taks JavaScript",
    message: "Error: <%= error.message %>"
  }))
  .pipe(source(sourceScript))
  .pipe(buffer())
  .pipe(gulpif(env === 'production', uglify()))
  .pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(sourcemaps.write('./maps'))
  .pipe(gulp.dest(configPath + '/js'))
  .on('end', function(){ gutil.log('JavaScript ready!'); })
  .pipe(connect.reload());
});
// gulp javascript
// NODE_ENV=production gulp javascript

// Sass processing
gulp.task('sass', function() {
  var config = {};
  if(env === 'development') {
    config.sourceComments = 'map';
  }
  if(env === 'production') {
    config.outputStyle = 'compressed';
  }
  return gulp.src('src/scss/main.scss')
    .pipe(sourcemaps.init())
    // Convert sass into css
    .pipe(sass(config))
    // Autoprefix properties
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    // Write sourcemaps
    .pipe(sourcemaps.write())
    // Save css
    .pipe(gulp.dest(configPath + '/css'))
    .on('end', function(){ gutil.log('CSS compiled!'); })
    //.pipe(connect.reload());
});
// gulp sass
// NODE_ENV=development gulp sass
// NODE_ENV=production gulp sass

gulp.task('watch', function() {
  gulp.watch('src/templates/**/*.jade', ['jade']);
  gulp.watch('src/js/**/*.js', ['javascript']);
  gulp.watch('src/scss/**/*.scss', ['sass']);
});

gulp.task('connect', connect.server({
  root: [outputDirDevelopment],
  port: 1337,
  livereload: true,
  open: {
    browser: 'Google Chrome' // if not working OS X browser: 'Google Chrome'
  }
}));

gulp.task('default', ['javascript', 'sass', 'jade', 'watch', 'connect']);
