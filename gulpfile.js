"use strict";

var fs = require('fs');
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
var changed = require('gulp-changed');
var newer = require('gulp-newer');
var gulpif = require('gulp-if');


var paths = {};

gulp.task('default', ['sass', 'compile', 'libs', 'resources']);

gulp.task('paths', function(done) {
		paths = JSON.parse(fs.readFileSync('./paths.json'));
		done();
});

gulp.task('resources', ['paths'], function() {
		if(paths.res)
				return gulp.src(paths.res)
				.pipe(changed('www/res/'))
				.pipe(gulp.dest('www/res/'));
});

gulp.task('libs', ['paths'], function() {
		if(paths.libs)
				return gulp.src(paths.libs)
				.pipe(plumber())
				.pipe(newer('www/js/lib.js'))
				.pipe(sourcemaps.init())
				.pipe(ngAnnotate({add: true}))
				.pipe(concat('lib.js'))
				.pipe(uglify({mangle: true}))
				.pipe(gulpif(paths.map, sourcemaps.write(paths.map)))
				.pipe(gulp.dest('www/js/'));
});

gulp.task('compile', ['paths'], function() {
		if(paths.src)
				return gulp.src(paths.src)
				.pipe(plumber())
				.pipe(newer('www/js/app.js'))
				.pipe(sourcemaps.init())
				.pipe(typescript({
						outFile: 'app.js'
				}))
				.pipe(babel({
						presets: ['es2015', 'react'],
				}))
				.pipe(ngAnnotate({add: true}))
				.pipe(uglify({mangle: true}))
				.pipe(gulpif(paths.map, sourcemaps.write(paths.map)))
				.pipe(gulp.dest('www/js/'));
});

gulp.task('sass', ['paths'], function(done) {
		if(paths.sass)
				gulp.src(paths.sass)
				.pipe(plumber())
				.pipe(newer('www/css/style.css'))
				.pipe(sass())
				.on('error', sass.logError)
				.pipe(concat('style.css'))
				.pipe(minifyCss({
						keepSpecialComments: 0
				}))
				.pipe(gulp.dest('www/css/'))
				.on('end', done);
});

gulp.task('watch', ['paths'], function() {
		gulp.watch('./paths.json', ['watch', 'default']);
		
		if(paths.sass)
				gulp.watch(paths.sass, ['sass']);
		
		if(paths.src)
				gulp.watch(paths.src, ['compile']);
		
		if(paths.res)
				gulp.watch(paths.res, ['resources']);

		if(paths.libs)
				gulp.watch(paths.libs, ['libs']);
		
});

gulp.task('install', ['git-check'], function(done) {
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
