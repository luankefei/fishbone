var gulp = require('gulp')
var jshint = require('gulp-jshint')
var concat = require('gulp-concat')
var rename = require('gulp-rename')
var uglify = require('gulp-uglify')

var karma = require('karma')
var browserSync = require('browser-sync')

//var server = require('tiny-lr')

var reload = browserSync.reload

var livereload = require('gulp-livereload')

// Lint JS
gulp.task('lint', function() {
    return gulp.src('src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
})

// Concat & Minify JS
gulp.task('minify', function() {
    return gulp.src('src/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
        .pipe(livereload())
});

// Watch Our Files
gulp.task('watch', function() {

    var server = livereload()

    livereload.listen()

    gulp.watch('src/*.js', ['lint', 'minify'], function(file) {
        server.changed(file.path)

    })
    //gulp.watch('view/*.html', ['lint', 'minify'])
})


// Static server
// gulp.task('browser-sync', function() {
//     browserSync.init({
//         server: {
//             baseDir: "./"
//         }
//     })
// })

// gulp.task('serve', [], function() {

//     browserSync.init({
//         server: {
//             baseDir: "./"
//         }
//     })

    
// })

// karma test
gulp.task('karma', function() {
    karma.server.start({
        configFile: process.cwd() + '/karma.conf.js',
        singleRun: true

    }, done)
})


// Default
//gulp.task('default', ['lint', 'minify', 'watch', 'browser-sync'])
gulp.task('default', ['lint', 'minify', 'watch', 'browser-sync'], function() {

    server.listen(8081, funtion(err) { 

        if (err) 
            return console.log(err) 
    })

    gulp.watch('./src/*.js').on('change', reload)



})

