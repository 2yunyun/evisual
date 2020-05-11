//使用严格模式的js。保证js的严谨，作为一个好习惯。
'use strict';

var gulp = require('gulp'),
    connect = require('gulp-connect'),
    browserSync = require('browser-sync').create(), //多浏览器多设备同步&自动刷新
    SSI = require('browsersync-ssi'),
    less = require('gulp-less'),
    useref = require('gulp-useref'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-clean-css'),
    gulpif = require('gulp-if'),
    imagemin = require('gulp-imagemin'),
    rev = require('gulp-rev'),
    revCollect = require('gulp-rev-collector'),
    clean = require('gulp-clean'),
    gulpSequence = require('gulp-sequence');




/*
 * gulp常用方法（gulpfile.js为例）
 * gulp.task() 创建gulp任务
 * gulp.src() gulp任务源文件查找
 * gulp.pipe() gulp工作流
 * gulp.dest() gulp任务输出
 */
 
/*
 * dev服务任务
 * 其他gulp-connect中的配置项说明：
 * root： 设置服务的启动根目录，当启动服务时，默认到此目录文件中找
 * livereload： 热加载（通过设置，当修改html，或css时，浏览器预览实时刷新效果）
 * port: 服务端口
 * host: 服务域名，默认为localhost,可以改为本机ip
*/

//创建一个名为serve的任务，该任务的内容就是匿名函数中的内容。
gulp.task('serve', function() {
    //使用browserSync创建服务器，自动打开浏览器并打开./dist文件夹中的文件（默认为index.html）
    browserSync.init({
        server: {
            baseDir:["./dist"],
            middleware:SSI({
                baseDir:'./dist',
                ext:'.shtml',
                version:'2.10.0'
            })
        }
    });
    //监听各个目录的文件，如果有变动则执行相应的任务操作文件
    gulp.watch("**/*.css", ['compass']);
    gulp.watch("**/*.js", ['js']);
    gulp.watch("./*.html", ['html']);
    //如果有任何文件变动，自动刷新浏览器
    gulp.watch("dist/*.html").on("change",browserSync.reload);
});


gulp.task('dev', function () {
    connect.server({
        port: 8060,
        livereload: true
    })
})

// css,js的压缩
gulp.task('compress', function () {
    return gulp.src('./*.html')
    .pipe(useref())
    .pipe(gulpif('*.js',uglify()))
    .pipe(gulpif('*.css',minifyCss()))
    .pipe(gulp.dest('./.tmp')) 
})
// 图片压缩
gulp.task('imagemin',function(){
    return gulp.src(['./img/*.*','./img/*/*.*'])
    .pipe(imagemin())
    .pipe(gulp.dest('./dist/img'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('./.tmp/rev/img'))
})
// css md5签名
gulp.task('css',function(){
    return gulp.src('./.tmp/css/*.css')
    .pipe(rev())  //给文件加md5签名后缀
    .pipe(gulp.dest('./dist/css')) //签名后输出目录
    .pipe(rev.manifest())  //设置md5签名文件的sourcemap 
    .pipe(gulp.dest('./.tmp/rev/css')) //设置map文件存放目录
})
// js md5签名
gulp.task('js',function(){
    return gulp.src(['./.tmp/js/*.js','./.tmp/scripts/*.js'])
    .pipe(rev())
    .pipe(gulp.dest('./dist/js'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('./.tmp/rev/js'))
})
// 路径替换
gulp.task('rev',function(){
    return gulp.src(['./.tmp/rev/**/*.json','./.tmp/*.html'])
    .pipe(revCollect())
    .pipe(gulp.dest('./dist'))
})


// html热加载
gulp.task('html', function () {
    return gulp.src('./*.html')
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload())
})


// 文件的清除
gulp.task('clean',function(){
    return gulp.src(['./dist','./.tmp'],{read:false})
    .pipe(clean())
})


/*
 * 1. 通过设置.tmp 文件夹用于缓存项目压缩文件，放置md5签名的sourcemap文件，通过rev-collector在.tmp中缓存的manifest.json中对应的文件名关系来替换html中的静态资源引用目录
 * 2. manifest.json : 在使用gulp-rev进行静态资源的md5签名后，通过rev.manifest()生成了签名后资源与html中引用位置的对应关系（即从原index.min.js变为index-1812ef94a5.min.js的引用）
*/




gulp.task('default', gulp.series(gulp.parallel('compress','js','css','rev','imagemin')), function () {
    console.log("----------gulp Finished----------");
});




