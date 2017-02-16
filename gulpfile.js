var gulp = require('gulp')
var watch = require('gulp-watch')
var rename = require('gulp-rename')
var runSequence = require('run-sequence').use(gulp)
var shell = require('gulp-shell');
var util = require('gulp-util');
var path = require('path')
var replace = require('gulp-replace')

var browserify = require('browserify')
var babelify = require('babelify')
var sourcemaps = require('gulp-sourcemaps')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var watchify = require('watchify')

var sass = require('gulp-sass')

var autoprefix = require('gulp-autoprefixer')
var notify = require('gulp-notify')
var livereload = require('gulp-livereload');

const JS_ROOT = './site/js/app.js'
const SCSS_ROOT = './site/scss/app.scss'
const BIN_FOLDER = './site/bin'

const WATCHED_JS_FILES = './site/js/**/*.js'
const WATCHED_SCSS_FILES = './site/scss/**/*.scss'


//----------------
const config = () => {
    const NODE_ENV = process.env.NODE_ENV
    return {
        NODE_ENV: NODE_ENV,
        isProduction: NODE_ENV == 'production',
        isDevelopment: NODE_ENV == 'development',
    }
}
//----------------

gulp.task('js', function() {
    const bundler = browserify(JS_ROOT, { debug: true })
        .transform(babelify, { 
            "presets": ["es2015", 'react'] //these require npm packages babel-preset-es2015, babel-preset-react
        })
    const bundle = bundler.bundle()
        .on('error', notify.onError(function (error) {
            return 'Error: ' + error.message
        }))
        .pipe(source('bundle.js'))
        .pipe(replace('gulp-replace-process-env-node-env', process.env.NODE_ENV))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(BIN_FOLDER))

    if(config().isDevelopment)
        bundle.pipe(livereload())

    return bundle
})

//if having issues add {"atomic_save": true} to sublime user settings
gulp.task('css', function() {
    const bundle = gulp.src(SCSS_ROOT)
        .pipe(
            sass({
                includePaths: [
                    './app/scss',
                ],
                style: 'compressed',
                loadPath: []
            })
            .on('error', notify.onError(function (error) {
                return 'Error: ' + error.message
            }))
        )
        .pipe(autoprefix('last 2 version'))
        .pipe(rename(function(path) {
            path.basename = 'bundle'
            path.extname = '.css'
        }))
        .pipe(gulp.dest(BIN_FOLDER))

    if(config().isDevelopment)
        bundle.pipe(livereload())

    return bundle
})

gulp.task('watch', function() {
    if(config().isDevelopment)
        livereload.listen()

    watch(WATCHED_JS_FILES, function(files) {
        runSequence('js')
    })
    
    watch(WATCHED_SCSS_FILES, function(files) {
        runSequence('css')
    })

    return runSequence('js', 'css')
})

//used for production
gulp.task('build', function() {
    runSequence('js', 'css')
})

gulp.task('start', function() {
    process.env.NODE_ENV = 'production'
    shell.task(['npm run start'])()
})

gulp.task('start-dev', function() {
    process.env.NODE_ENV = 'development'
    runSequence('watch')
    shell.task(['npm run start'])()
})

gulp.task('default', ['start-dev'])
