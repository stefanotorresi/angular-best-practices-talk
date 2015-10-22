var gulp    = require('gulp');
var plugins = require('gulp-load-plugins')();
var del     = require('del');
var path    = require('path');
var argv    = require('yargs').argv;
var gulpsync = plugins.sync(gulp);

var isProduction = argv.production || argv.prod || false;
var paths = {
    dist: './',
    jade: 'jade/'
};

var srcFiles = {
    jade: [ paths.jade + '**/*.jade' ]
};

gulp.task('clean', function (cb) {
    log('Cleaning dist directory...');
    del([ './index.html' ], { force: true }, cb);
});

gulp.task('jade', function() {
    log('Building HTML from Jade sources...');
    return gulp.src([].concat(srcFiles.jade, '!**/_*.*'))
        .pipe(plugins.changed(paths.dist, {extension: '.html'}))
        .pipe(plugins.jade())
        .on('error', handleError)
        .pipe(plugins.htmlPrettify({
            indent_char: ' ',
            indent_size: 2,
            unformatted: ['sub', 'sup', 'b', 'i', 'u']
        }))
        .pipe(gulp.dest(paths.dist))
    ;
});

gulp.task('watch', function() {
    log('Starting watch and LiveReload...');

    plugins.livereload.listen();

    gulp.watch([ paths.jade, srcFiles.jade ], ['jade']);

    // a delay before triggering browser reload to ensure everything is compiled
    var livereloadDelay = 1500;

    // list of source file to watch for live reload
    var watchSource = [].concat(
        srcFiles.jade
    );

    gulp.watch(watchSource)
        .on('change', function(event) {
            setTimeout(function() {
                plugins.livereload.changed(event.path);
            }, livereloadDelay);
        })
        .on('error', handleError)
    ;

    log('************************');
    log('* Watching for changes *');
    log('************************');
});

gulp.task('build', gulpsync.sync([
    'clean',
    [
        'jade'
    ]
]), function(){
    log('*******************');
    log('* Build Completed *');
    log('*******************');
});

gulp.task('default', gulpsync.sync([
    'build'
]));

/////////////////////

// Error handler
function handleError(err) {
    log(err.toString());
    this.emit('end');
}

// log to console using
function log(msg) {
    plugins.util.log(plugins.util.colors.blue(msg));
}
