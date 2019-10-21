"use strict";

/*global require*/
const autoprefixer = require('autoprefixer'),
	  	babel 			 = require('gulp-babel'),
	  	browserSync  = require('browser-sync'),
	  	changed 		 = require('gulp-changed'),
	  	concat 			 = require('gulp-concat'),
	  	data 				 = require('gulp-data'),
	  	rename 			 = require('gulp-rename'),
	  	livereload 	 = require('gulp-livereload'),
	  	del 				 = require('del'),
	  	gulp  			 = require('gulp'),
	  	gulpif 			 = require('gulp-if'),
	  	imagemin 		 = require('gulp-imagemin'),
	  	path 				 = require('path'),
	  	plumber 		 = require('gulp-plumber'),
	  	postcss 		 = require('gulp-postcss'),
	  	pug 				 = require('gulp-pug'),
	  	runSequence  = require('run-sequence'),
	  	sass 				 = require('gulp-sass'),
	  	sourcemaps 	 = require('gulp-sourcemaps'),
	  	uglify 			 = require('gulp-uglify'),
 	  	minifycss 	 = require('gulp-minify-css'),
 	  	svgSprite 	 = require('gulp-svg-sprite'),
 	  	lr 					 = require('tiny-lr'),
  	  server 			 = lr();

/**
 * List of options
 */
const options = {
	uglifyJS: 	true,
	sourceMaps: true,
	useBabel: 	true,
};

/*
 * List of directories
 */
const paths = {
	input: {
		sass: 	'./src/sass/',
		data: 	'./src/_data/',
		js: 		'./src/js/',
		images: './src/img/default/',
		sprite: './src/img/sprite/',
		fonts:  './src/fonts/**/*'
	},
	output: {
		css: 		'./public/css/',
		js: 		'./public/js/',
		images: './public/img/',
		fonts: 	'./public/fonts'
	},
	public: 	'./public/',
};

/**
 *  Concat all scripts and make sourcemap
 */
gulp.task('javascript', () => {
	return gulp.src([paths.input.js + 'vendor/**/*.js', paths.input.js + '**/*.js'])
	.pipe(plumber())
	.pipe(gulpif(options.sourceMaps, sourcemaps.init()))
	.pipe(gulpif(options.useBabel, babel({
		presets: ['@babel/preset-env']
	})))
	.pipe(concat('script.js'))
	.pipe(gulpif(options.uglifyJS, uglify()))
	.pipe(gulpif(options.sourceMaps, sourcemaps.write('../maps')))
	.pipe(rename({ suffix: '.min' }))
  	.pipe(livereload(server))
	.pipe(gulp.dest(paths.output.js))
	.pipe(browserSync.reload({
		stream: true
	}));
});

/*
* Minify all images
*/
gulp.task('image-min', () => {
	return gulp.src(paths.input.images + '**/*.+(png|jpg|gif|svg|jpeg)')
	.pipe(plumber())
	.pipe(changed(paths.output.images))
	.pipe(imagemin())
	.pipe(gulp.dest(paths.output.images));
});

/**
 * sprite
 */
 gulp.task('svgSprite', function () {
    return gulp.src(paths.input.sprite + '*.svg') 
    .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: "../sprite.svg" 
                }
            },
        }
    ))
    .pipe(gulp.dest(paths.output.images));
});

 /**
 * Copy fonts
 */
gulp.task('copy', () => {
  gulp.src(paths.input.fonts)
  .pipe(gulp.dest(paths.output.fonts));
});

/**
 * Compile .scss files and sourcemaps (optional)
 */
gulp.task('sass', () => {
	return gulp.src(paths.input.sass + '*.scss')
	.pipe(plumber())
	.pipe(gulpif(options.sourceMaps, sourcemaps.init()))
	.pipe(sass({
		includePaths: [paths.input.sass],
		outputStyle: 'compressed'
	}))
	.pipe(postcss([autoprefixer()]))
	.pipe(gulpif(options.sourceMaps, sourcemaps.write('../maps')))
	.pipe(rename({ suffix: '.min' }))
    .pipe(livereload(server))
	.pipe(gulp.dest(paths.output.css))
	.pipe(browserSync.reload({
		stream: true
	}));
});

  /**
 * Compile .pug files and pass in data from json file
 */
gulp.task('pug', () => {
	return gulp.src('./src/*.pug')
	.pipe(plumber())
	.pipe(data(function (file) {
		const json = paths.input.data + path.basename(file.path) + '.json';
		delete require.cache[require.resolve(json)];
		return require(json);
	}))
	.pipe(pug())
	.pipe(pug({pretty: true}))
	.pipe(gulp.dest(paths.public))
	.pipe(browserSync.reload({
		stream: true
	}));
});

/**
 * Recompile .pug files and live reload the browser
 */
gulp.task('rebuild', ['pug'], () => {
	browserSync.reload();
});

/**
 * Launch the browser-sync Server
 */
gulp.task('browser-sync', () => {
	browserSync({
		server: {
			baseDir: paths.public
		},
		notify: false
	});
});

/**
 * Removing public folder with it contents
 */
gulp.task('build-clean', () => {
	return del(paths.public);
});


/**
 * Task group for development
 */
gulp.task('develop', () => {
	runSequence('build-clean',
		['sass', 'javascript', 'image-min', 'svgSprite', 'pug', 'copy'],
		'browser-sync');
});

/**
 * Building distributive
 */
gulp.task('build-dist', () => {
	runSequence('build-clean',
		['sass', 'javascript', 'image-min', 'svgSprite', 'pug', 'copy']);
});

/**
 * Watch files for changes
 */
gulp.task('watch', () => {
	gulp.watch(paths.input.sass + '**/*.scss', ['sass']);
	gulp.watch(paths.input.js + '**/*.js', ['javascript']);
	gulp.watch(paths.input.images + '**/*', ['image-min']);
	gulp.watch(['./src/**/*.pug', './src/**/*.json'], ['pug']);
});

/**
 * Shorthand for build-dist
 */
gulp.task('build', ['build-dist']);

/**
 * Default task for development, fast-start by 'gulp' command
 */
gulp.task('default', ['develop', 'watch']);
