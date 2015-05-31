var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify')

var karma = require('karma')
//var browserSync = require('browser-sync')

var connect = require('gulp-connect')
var livereload = require('gulp-livereload')


// 路径配置
var paths = {

    scripts: [
            'src/dev/_intro.js',
            'src/main.js',
            'src/prototype.js',
            'src/http.js',
            'src/node.js',
            'src/route.js',
			'src/event.js',
            'src/module.js',
            'src/css.js',
            'src/extend.js',
            'src/dev/_outro.js'
            ],
    images: ''
}

gulp.task('connect', ['minify'], function() {

    connect.server({
        root: '',
        livereload: true
    })
})

// Lint JS
gulp.task('lint', ['minify'], function() {
    return gulp.src('dist/fishbone.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
})

// Concat & Minify JS
gulp.task('minify', function() {
    return gulp.src(paths.scripts)
        .pipe(concat('fishbone.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('fishbone.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
        .pipe(livereload())
});

gulp.task('html', function() {

    livereload.reload()
})

gulp.task('script', function() {

    livereload.reload()
})

// Watch Our Files
gulp.task('watch', function() {

    var server = livereload({ start: true })

    livereload.listen()

    gulp.watch('*.html', ['html'], function(file) {

        server.changed(file.path)

        server.reload()
    })

    gulp.watch('src/*.js', ['lint', 'minify', 'script'], function(file) {

        server.changed(file.path)

    })
})

// karma test
gulp.task('karma', function() {
    karma.server.start({
        configFile: process.cwd() + '/karma.conf.js',
        singleRun: true

    }, done)
})

// Default
//gulp.task('default', ['lint', 'minify', 'watch', 'browser-sync'])
gulp.task('default', ['minify', 'watch', 'connect'])
gulp.task('package', ['minify'])
gulp.task('test', ['lint'])

