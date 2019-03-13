//gulp 的配置文件
var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var watchPath = require('gulp-watch-path');
var combiner = require('stream-combiner2');
var sourcemaps = require('gulp-sourcemps');//压缩后的代码不存在换行符和空白符，导致出错后很难调试，



// 执行命令：gulp --任务名
gulp.task('defaultone',function(){
    gutil.log('message');
    gutil.log(gutil.colors.red('error')); //字体颜色  
    gutil.log(gutil.colors.green('message:')+'第一颜色会出现绿色的');
})

gulp.task('uglifyjs',function(){//压缩js 
    gulp.src('src/js/**/*.js')//文件地址
        .pipe(uglify())//压缩
        .pipe(gulp.dest('dist/js'));//压缩到的地址
})
gulp.task('defaulttwo',function(){
    gulp.watch('src/js/**/*.js',['uglifyjs']);
})
//重新编译被修改的文件。
gulp.task('watchjs',function(){ 
    gulp.watch('src/js/**/*.js',function(event){
        var paths = watchPath(event,'src/','dist/');
        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath);
        gulp.src(paths.srcPath)
            .pipe(uglify())
            .pipe(gulp.dest(paths.distDir))
    })
})
gulp.task('defaultthree', ['watchjs'])//可以启动多个任务，加任务列表
//遇到错误，捕获错误信息,命令行会出现错误提示。而且不会让 gulp 停止运行
var handleError = function(err){
    var colors = gutil.colors;
    console.log('\n');
    gutil.log(colors.red('error!'));
    gutil.log('fileName: ' + colors.red(err.fileName));
    gutil.log('lineNumber: ' + colors.red(err.lineNumber));
    gutil.log('message: ' + err.message);
    gutil.log('plugin: ' + colors.yellow(err.plugin)) ;   
}

gulp.task('watchjs',function () {
    gulp.watch('src/js/**/*.js',function(event){
        var paths = watchPath(event,'src/','dist/')
          /* paths
            { srcPath: 'src/js/log.js', 具体路径
              srcDir: 'src/js/', 目录
              distPath: 'dist/js/log.js',
              distDir: 'dist/js/',
              srcFilename: 'log.js',
              distFilename: 'log.js' }
        */
       gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath);
       gutil.log('Dist ' + paths.distPath);
       var combined = combiner.obj([
           gulp.src(paths.srcPath),
           sourcemaps.init(),
           uglify(),
           sourcemaps.write('./'),
           gulp.dest(paths.distDir)
       ])
       combined.on('error',handleError);
    })
})
gulp.task('defaultfour', ['watchjs'])


