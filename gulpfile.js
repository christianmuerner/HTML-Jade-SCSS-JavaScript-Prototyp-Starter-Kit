'use strict';
// load all install packages
var browserify = require('browserify');
var autoprefixer = require('gulp-autoprefixer');
var gulp = require('gulp');
var connect = require('gulp-connect-multi')();
var gulpif = require('gulp-if');
var imagemin    = require('gulp-imagemin');
var jade = require('gulp-jade');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');

// Error notifications
var reportError = function(error) {
  notify({
    title: 'Gulp Task Error',
    message: "Error: <%= error.message %>"
  }).write(error);
  console.log(gutil.colors.red(error.toString()));
  this.emit('end');
}

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

// Jade Template Engine
gulp.task('jade', function() {
  return gulp.src(['src/templates/jade/**/*.jade', '!./jade/{templates,templates/**/*,includes,convert}/*'])
    // Error handling
    .pipe(plumber(reportError))
    // Generate Templates
    .pipe(jade({
      pretty: true
    }))
    // Templates Destination
    .pipe(gulp.dest(configPath))
    .on('end', function(){ gutil.log(gutil.colors.green('Jade to HTML - Successful')); })
    .pipe(connect.reload());
});
// Terminal input for this task
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
  .on('error', reportError)
  .pipe(source(sourceScript))
  .pipe(buffer())
  .pipe(gulpif(env === 'production', uglify()))
  .pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(sourcemaps.write('./maps'))
  .pipe(gulp.dest(configPath + '/js'))
  .on('end', function(){ gutil.log(gutil.colors.green('Scripts - Successful')); })
  .pipe(connect.reload());
});
// Terminal input for this task
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
    // Error handling
    .pipe(plumber(reportError))
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
    .on('end', function(){ gutil.log(gutil.colors.green('SCSS to CSS - Successful')); })
    .pipe(connect.reload());
});
// Terminal input for this task
// gulp sass
// NODE_ENV=development gulp sass
// NODE_ENV=production gulp sass

// Image Compression Task with 'gulp build'
gulp.task('imagemin', function () {
  var cache = require('gulp-cache');
  var imagemin = require('gulp-imagemin');
  return gulp.src('./images/**/*')
    // Error handling
    .on('error', reportError)
    .pipe(cache(imagemin({
        progressive: true,
        interlaced: true
    })))
    .pipe(gulp.dest(outputDirDevelopment + '/img'))
    .pipe(notify(gutil.colors.green('Images Compressed - Successful')));
});

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
