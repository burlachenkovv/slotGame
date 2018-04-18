"use strict"

const gulp = require('gulp'),
      babelify = require('babelify'),
      browserify = require('browserify'),
      source = require('vinyl-source-stream'),
      buffer = require('vinyl-buffer'),
      watchify = require('watchify'),
      rename = require('gulp-rename'),
      gutil = require('gulp-util'),
	  
	  browserSync = require("browser-sync"),
	  reload = browserSync.reload;

const config = {
  src: {
    html: 'src/index.html',
    js: 'src/js/script.js',
    lib: 'src/lib/*.js',
    img: 'src/img/*.*',
    css: 'src/css/*.css',
    fonts: 'src/fonts/*.*',
  },
  dest: {
    html: 'build/',
    js: 'build/js/',
    lib: 'build/lib/',
    img: 'build/img/',
    css: 'build/css/',
    fonts: 'build/fonts/',
  }
};

const serverConfig = {
  server: {
    baseDir: "./build/"
  },
  tunnel: false,
  host: 'localhost',
  port: 7000,
  logPrefix: "slotGame"
}

let bundle = (bundler) => {
  bundler
    .bundle()
    .pipe(source('bundled-app.js'))
    .pipe(buffer())
    .pipe(rename('main.js'))
    .pipe(gulp.dest(config.dest.js))
    .on('end', () => gutil.log(gutil.colors.green('==> Successful Bundle!')));
}

gulp.task('webserver', function () {
  browserSync(serverConfig);
});

gulp.task('br', function () {
  let bundler = browserify(config.src.js, {debug: true})
                  .plugin(watchify) 
                  .transform(babelify, {presets: ['env']}); 

  bundle(bundler);

  bundler.on('update', () => bundle(bundler));
});

gulp.task('html:build', function() {
  gulp.src(config.src.html)
    .pipe(gulp.dest(config.dest.html))
});
gulp.task('img:build', function() {
  gulp.src(config.src.img)
    .pipe(gulp.dest(config.dest.img))
});
gulp.task('lib:build', function() {
  gulp.src(config.src.lib)
    .pipe(gulp.dest(config.dest.lib))
});
gulp.task('css:build', function() {
  gulp.src(config.src.css)
    .pipe(gulp.dest(config.dest.css))
});
gulp.task('fonts:build', function() {
  gulp.src(config.src.fonts)
    .pipe(gulp.dest(config.dest.fonts))
});

gulp.task('build', [
  'html:build',
  'img:build',
  'lib:build',
  'css:build',
  'fonts:build'
]);

gulp.task('default', ['br', 'build', 'webserver']);
