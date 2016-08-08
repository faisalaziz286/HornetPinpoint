var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var typescript = require('gulp-typescript');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var babel = require("gulp-babel");
var plumber = require("gulp-plumber");
var sourcemaps = require('gulp-sourcemaps');

var paths = {
		sass: ['./scss/**/*.scss'],
		src: ['./src/**/*.ts']
};

gulp.task('default', ['sass', 'compile']);

gulp.task('compile', function() {
		return gulp.src(paths.src)
				.pipe(plumber())
				.pipe(sourcemaps.init())
				.pipe(typescript({
						outFile: 'app.js'
				}))
				.pipe(babel({
						presets: ['es2015', 'react']
				}))
				.pipe(ngAnnotate({add: true}))
				.pipe(uglify({mangle: true}))
				.pipe(sourcemaps.write('.'))
				.pipe(gulp.dest('www/js/'));
});

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
		gulp.watch(paths.sass, ['sass']);
		gulp.watch(paths.src, ['compile']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
