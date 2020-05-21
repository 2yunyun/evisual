//使用严格模式的js。保证js的严谨，作为一个好习惯。
'use strict';

var gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    SSI = require('browsersync-ssi'),//多浏览器多设备同步&自动刷新
    concat = require('gulp-concat'),//整合文件
    autoprefixer = require('gulp-autoprefixer'),
    base64 = require('gulp-base64'),
    cssmin = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'), //混淆js   暂时没用到
    minify = require('gulp-minify'), //压缩js
    plumber = require('gulp-plumber'),//错误处理插件plumber
    compass = require('gulp-compass'),    //compass 用来编译sass
    imagemin = require('gulp-imagemin'),//压缩图片
    cache = require('gulp-cache'),
    clean = require('gulp-clean'), //clean 用来删除文件
    zip = require('gulp-zip'),//压缩文件
    runSequence = require('gulp-run-sequence');//控制task中的串行和并行。这个很重要，它能够严格规定task的执行顺序，否则gulp默认并行，有些时候会产生问题。如先清空再重建文件，可能重建过程中又清空了。


/*
 * gulp常用方法（gulpfile.js为例）
 * gulp.task() 创建gulp任务
 * gulp.src() gulp任务源文件查找
 * gulp.pipe() gulp工作流
 * gulp.dest() gulp任务输出
 */
 
//创建一个名为serve的任务，该任务的内容就是匿名函数中的内容。
gulp.task('serve', function () {
    //使用browserSync创建服务器，自动打开浏览器并打开./dist文件夹中的文件（默认为index.html）
   return browserSync.init({
        server: {
            baseDir: ["./dist"],
            middleware: SSI({
                baseDir: './dist',
                ext: '.html',
                version: '1.0.0'
            })
        }
    });
    //监听各个目录的文件，如果有变动则执行相应的任务操作文件
   
    gulp.watch("./js/*.js", ['js']);
    gulp.watch("./*.html", ['html']);
    gulp.watch(["./img/*.*","./img/**/*.*"], ['img']);
    gulp.watch("./css/*.css", ['styles']);
    // gulp.watch("./font/*", ['font'])
    //如果有任何文件变动，自动刷新浏览器
    gulp.watch("dist/*.html").on("change", browserSync.reload);
});


//通过gulp处理css的自动前缀
//通过gulp将css中的图片转换成base64编码
//通过gulp将css进行压缩
gulp.task('styles', function() {
    return gulp.src(['./css/*.css','!./css/*.min.css']) //源文件路径
        //错误管理模块
        .pipe(plumber())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false      // 是否美化
        })) //自动前缀
        //.pipe(base64()) //base64编码
        .pipe(cssmin()) //css压缩
        .pipe(gulp.dest('dist/css')) //目的路径
        //自动刷新浏览器
        .pipe(browserSync.stream());
});

gulp.task('stylesmin', function() {
    return gulp.src('./css/*.min.css') //源文件路径
        //错误管理模块
        .pipe(plumber())
        .pipe(gulp.dest('dist/css')) //目的路径
        //自动刷新浏览器
        .pipe(browserSync.stream());
});

//js任务，将js压缩后放入dist。该任务要在clean-scripts任务完成后再执行
gulp.task('js', function () {
    //首先取得app/javascript下的所有后缀为.js的文件（**/的意思是包含所有子文件夹）
    return gulp.src(['./js/*.js','!./js/*.min.js'])
    //错误管理模块
        .pipe(plumber())
        //目前没用混淆，不方便调试
        //.pipe(uglify())
        //js压缩
        .pipe(minify())
        //输出到dist/javascript
        .pipe(gulp.dest("dist/js"))
        //自动刷新浏览器
        .pipe(browserSync.stream());
});
gulp.task('jsmin', function () {
    //首先取得app/javascript下的所有后缀为.js的文件（**/的意思是包含所有子文件夹）
    return gulp.src('./js/*.min.js')
    //错误管理模块
        .pipe(plumber())
        .pipe(gulp.dest("dist/js"))
        //自动刷新浏览器
        .pipe(browserSync.stream());
});

//html任务，目前什么都没做。只是单纯的把所有html从开发环境app复制到测试环境dist
gulp.task('html', function () {
    return gulp.src("./*.html")
        .pipe(plumber())
        .pipe(gulp.dest("dist/"))
        .pipe(browserSync.stream());
});

// 处理图片
/**
* @param plugins {Array} 
*   default: （不支持的文件将被忽略）
*       [
*           imagemin.gifsicle(),    压缩GIF
*           imagemin.jpegtran(),    压缩JPEG
*           imagemin.optipng(), 压缩PNG
*           imagemin.svgo()     压缩SVG
*       ]
* 
* @param options {Object}
*   {
*       optimizationLevel {Number} 取值范围：0-7（优化等级），默认：3
*       progressive {Boolean} 无损压缩jpg图片，默认：false 
*       interlaced {Boolean} 隔行扫描gif进行渲染，默认：false 
*       multipass {Boolean} 多次优化svg直到完全优化，默认：false 
*   }
*/

//imagemin([plugins], [options])

gulp.task('images', function () {
    return gulp.src(['./img/*.*','./img/**/*.*'])
    //错误处理模块
        .pipe(plumber())
        .pipe(cache(imagemin({
            optimizationLevel: 5, // 取值范围：0-7（优化等级），默认：3  
            progressive: true,  // 无损压缩jpg图片，默认：false 
            interlaced: true,   // 隔行扫描gif进行渲染，默认：false 
            multipass: true         // 多次优化svg直到完全优化，默认：false 
        })))
        .pipe(gulp.dest('dist/img'))
        .pipe(browserSync.stream());
});

gulp.task('media', function () {
    return gulp.src("./media/*")
        .pipe(plumber())
        .pipe(gulp.dest("dist/media"))
        .pipe(browserSync.stream());
});



//publish任务，需要的时候手动执行，将dist中的文件打包压缩放到release中。
gulp.task('publish', function () {
    //取得dist文件夹中的所有文件
    return gulp.src('dist/*')
        //错误处理模块
        .pipe(plumber())
        //压缩成名为publish.zip的文件
        .pipe(zip('publish.zip'))
        //放入release文件夹
        .pipe(gulp.dest('release'))
});


//clean任务：清空dist文件夹，下边重建dist的时候使用
gulp.task('clean', function () {
    return gulp.src('dist/*', {read: false})
        .pipe(clean());
});






//redist任务：需要时手动执行，重建dist文件夹：首先清空，然后重新处理所有文件
gulp.task('redist', gulp.series(gulp.parallel( 'html',['js', 'images','styles'])), function () {
    console.log("----------gulp Finished----------");
});


//建立一个名为default的默认任务。当你在gitbash中执行gulp命令的时候，就会
gulp.task('default', gulp.series(gulp.parallel('redist', 'serve')), function () {
    console.log("----------gulp Finished----------");
});

