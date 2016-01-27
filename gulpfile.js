var gulp = require('gulp'),
    jade = require('jade'),
    jadee = require('gulp-jade'),
    sass = require('gulp-sass'),
    csso = require('gulp-csso'),
    compressjs = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    prefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    webserver = require('gulp-webserver'),
    plumber = require('gulp-plumber'),
    watch = require('gulp-watch'),
    notify = require('gulp-notify'),
    cleaner = require('rimraf'),
    sequence = require('gulp-sequence'),
    path = {
      src: {
        html: 'resources/views/pages/*.jade',
        css: {
          scss: 'resources/styles/main/style.scss',
          vendor: 'resources/styles/vendor/*.css'
        },
        js: {
          main: 'resources/scripts/*.js',
          vendor: 'resources/scripts/vendor/*.js'
        },
        img: 'resources/images/**/*.*'
      },
      watch: {
        html: 'resources/views/**/*.jade',
        css: 'resources/styles/main/*.scss',
        js: 'resources/scripts/*.js',
        img: 'resources/images/**/*.*'
      },
      build: {
        html: 'build/',
        css: 'build/css/',
        js: 'build/js/',
        img: 'build/img/'
      }
    };

// Запуск локального сервера
gulp.task('localserver', function() {
  gulp.src(path.build.html)
    .pipe(webserver({
      livereload: true,
      open: true,
      fallback: 'index.html'
    }));
});

// Чистка папки продакшена
gulp.task('clean', function (cb) {
    cleaner(path.build.html, cb);
});

// Запуск компиляции HTML
gulp.task('html', function() {

  gulp.src(path.src.html)
    .pipe(plumber())
    .pipe(jadee({
      jade: jade,
      pretty: true
    }))
    .pipe(gulp.dest(path.build.html))
    .pipe(notify(("Файл <%= file.relative %> изменен!")));
});

// Запуск компиляции CSS из SCSS
gulp.task('css', function() {
  gulp.src(path.src.css.scss)
    .pipe(plumber())
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(prefixer({
      browsers: ['> 1%','not ie < 8','last 5 versions'],
      cascade: false
    }))
    .pipe(gulp.dest(path.build.css))
    .pipe(notify(("Файл <%= file.relative %> изменен!")));
});

// Сжатие javascript
gulp.task('js', function() {
  return gulp.src(path.src.js.main)
    .pipe(plumber())
    .pipe(compressjs())
    .pipe(rename(function (path) {
      path.basename += ".min"
    }))
    .pipe(gulp.dest(path.build.js))
    .pipe(notify(("Файл <%= file.relative %> сжат!")));
});

// Сжатие изображений
gulp.task('image', function() {
  return gulp.src(path.src.img)
    .pipe(plumber())
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(path.build.img))
    .pipe(notify(("Файл <%= file.relative %> сжат!")));
});

gulp.task('vendors', function() {
  var styles = gulp.src(path.src.css.vendor)
    .pipe(plumber())
    .pipe(csso())
    .pipe(rename(function (path) {
      path.basename += ".min"
    }))
    .pipe(gulp.dest(path.build.css))
    .pipe(notify(("Файл <%= file.relative %> сжат!")));

  var scripts = gulp.src(path.src.js.vendor)
    .pipe(plumber())
    .pipe(compressjs())
    .pipe(rename(function (path) {
      path.basename += ".min"
    }))
    .pipe(gulp.dest(path.build.js))
    .pipe(notify(("Файл <%= file.relative %> сжат!")));

    return styles, scripts;
})

// Наблюдение за изменением файлов
gulp.task('default', ['localserver'], function() {

    watch([path.watch.html], function(event, cb) {
      gulp.start('html');
    });
    watch([path.watch.css], function(event, cb) {
      gulp.start('css');
    });
    watch([path.watch.js], function(event, cb) {
      gulp.start('js');
    });
    watch([path.watch.img], function(event, cb) {
      gulp.start('image');
    });
});

// Выполнение всех тасков по порядку
gulp.task('build', sequence('clean', ['html', 'css'], 'vendors', 'js', 'image'));