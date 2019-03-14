//gulp 的配置文件
var gulp = require('gulp');
var gutil = require('gulp-util');//gutill 的工具集
var uglify = require('gulp-uglify');//压缩js
var watchPath = require('gulp-watch-path');//监听
var combiner = require('stream-combiner2');//捕获错误信息，收取所有管道的错误流
var sourcemaps = require('gulp-sourcemaps');//压缩后的代码不存在换行符和空白符，导致出错后很难调试，会压缩一个map的文件
//解决找到出错的原始位置
var minifycss  = require('gulp-minify-css');//压缩css
var autoprefixer = require('gulp-autoprefixer')//处理css 的兼容模式
var less = require('gulp-less');
// var sass = require('gulp-ruby-sass');//电脑上没有安装ruby换插件
var sass = require('gulp-sass');
var imagemin = require('gulp-imagemin');

var handlebars = require('gulp-handlebars');//Handlebars模板转换成 JavaScript
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');



// 执行命令：gulp --任务名
gulp.task('defaultone',function(){
    gutil.log('message');
    gutil.log(gutil.colors.red('error')); //字体颜色  
    gutil.log(gutil.colors.green('message:')+'第一颜色会出现绿色的');
})

// gulp.task('uglifyjs',function(){//压缩js 
//     gulp.src('src/js/**/*.js')//文件地址
//         .pipe(uglify())//压缩
//         .pipe(gulp.dest('dist/js'));//压缩到的地址
// })
// gulp.task('defaulttwo',function(){
//     gulp.watch('src/js/**/*.js',['uglifyjs']);//加入了任务队列
// })
//重新编译被修改的文件。
// gulp.task('watchjss',function(){ 
//     gulp.watch('src/js/**/*.js',function(event){
//         var paths = watchPath(event,'src/','dist/');
//         gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
//         gutil.log('Dist ' + paths.distPath);
//         gulp.src(paths.srcPath)
//             .pipe(uglify())
//             .pipe(gulp.dest(paths.distDir))
//     })
// })
// gulp.task('defaultthree', ['watchjs'])//可以启动多个任务，加任务列表
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
//用于监听
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
           uglify(),//一次编译所有 js 文件 gulp uglifyjs
           sourcemaps.write('./'),
           gulp.dest(paths.distDir)
       ])
       combined.on('error',handleError);
    })
})
//用于build 时候
gulp.task('uglifyjs', function () {
    var combined = combiner.obj([
        gulp.src('src/js/**/*.js'),
        sourcemaps.init(),
        uglify(),
        sourcemaps.write('./'),
        gulp.dest('dist/js/')
    ])
    combined.on('error', handleError)
})

//autoprefixer 会自动补全css一些兼容的方式
gulp.task('watchcss',function(){
    gulp.watch('src/css/**/*.css',function(event){
        var paths = watchPath(event,'src/','dist/');
        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath);
        gutil.log('Dist ' + paths.distPath);

        gulp.src(paths.srcPath)
            .pipe(sourcemaps.init())
            .pipe(autoprefixer({
                browsers:'last 2 versions'
            }))
            .pipe(minifycss())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(paths.distDir))
    })
})
gulp.task('minifycss', function () {
    gulp.src('src/css/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
          browsers: 'last 2 versions'
        }))
        .pipe(minifycss())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/css/'))
})
//压缩less,对比css的写法,这种监听路径一定要写对。less最终会打包成css的形式
gulp.task('watchless',function(){
    gulp.watch('src/less/**/*.less',function(event){
        var paths = watchPath(event,'src/less/','dist/css/');
        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath);
        gutil.log('Dist ' + paths.distPath);

        var combined = combiner.obj([
            gulp.src(paths.srcPath),
            sourcemaps.init(),
            autoprefixer({
                browsers:'last 2 versions'
            }),
            less(),
            minifycss(),
            sourcemaps.write('./'),
            gulp.dest(paths.distDir)

        ])
        combined.on('error',handleError);
    })
})
gulp.task('lesscss', function () {
    var combined = combiner.obj([
            gulp.src('src/less/**/*.less'),
            sourcemaps.init(),
            autoprefixer({
              browsers: 'last 2 versions'
            }),
            less(),
            minifycss(),
            sourcemaps.write('./'),
            gulp.dest('dist/css/')
        ])
    combined.on('error', handleError)
})
//压缩sass
gulp.task('watchsass',function () {
    gulp.watch('src/sass/**/*', function (event) {
        var paths = watchPath(event, 'src/sass/', 'dist/sass/')

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)
        sass(paths.srcPath)
            .on('error', function (err) {
                console.error('Error!', err.message);
            })
            .pipe(sourcemaps.init())
            .pipe(minifycss())
            .pipe(autoprefixer({
              browsers: 'last 2 versions'
            }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(paths.distDir))
    })
})
gulp.task('sasscss', function () {
    sass('src/sass/*')
    .on('error', function (err) {
        console.error('Error!', err.message);
    })
    .pipe(sourcemaps.init())
    .pipe(minifycss())
    .pipe(autoprefixer({
      browsers: 'last 2 versions'
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/css'))
})
//image 任务
gulp.task('watchimage', function () {
    gulp.watch('src/images/**/*', function (event) {
        var paths = watchPath(event,'src/','dist/')

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        gulp.src(paths.srcPath)
            .pipe(imagemin({
                progressive: true
            }))
            .pipe(gulp.dest(paths.distDir))
    })
})
gulp.task('image', function () {
    gulp.src('src/images/**/*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('dist/images'))
})
//文件复制任务添加
gulp.task('watchcopy', function () {
    gulp.watch('src/fonts/**/*', function (event) {
        var paths = watchPath(event)

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        gulp.src(paths.srcPath)
            .pipe(gulp.dest(paths.distDir))
    })
})
gulp.task('copy', function () {
    gulp.src('src/fonts/**/*')
        .pipe(gulp.dest('dist/fonts/'))
})
gulp.task('watchtemplates', function () {
    gulp.watch('src/templates/**/*', function (event) {
        var paths = watchPath(event, 'src/', 'dist/')

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        var combined = combiner.obj([
            gulp.src(paths.srcPath),
            handlebars({
              // 3.0.1
              handlebars: require('handlebars')
            }),
            wrap('Handlebars.template(<%= contents %>)'),
            declare({
              namespace: 'S.templates',
              noRedeclare: true
            }),
            gulp.dest(paths.distDir)
        ])
        combined.on('error', handleError)
    })
})

gulp.task('templates', function () {
        gulp.src('src/templates/**/*')
        .pipe(handlebars({
          // 3.0.1
          handlebars: require('handlebars')
        }))
        .pipe(wrap('Handlebars.template(<%= contents %>)'))
        .pipe(declare({
          namespace: 'S.templates',
          noRedeclare: true
        }))
        .pipe(gulp.dest('dist/templates'))
})
gulp.task('default', [
    // build
    'uglifyjs', 'minifycss', 'lesscss', 'sasscss', 'image', 'copy','templates',
    // watch
    'watchjs', 'watchcss', 'watchless', 'watchsass', 'watchimage', 'watchcopy','watchtemplates'
    ]
)



