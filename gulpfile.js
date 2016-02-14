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
  prettify = require('gulp-jsbeautifier'),
  watch = require('gulp-watch'),
  notify = require('gulp-notify'),
  cleaner = require('rimraf'),
  sequence = require('gulp-sequence'),
  bower = require('main-bower-files'),
  path = {
    src: {
      html: 'resources/views/pages/**/*.jade',
      css: 'resources/styles/style.scss',
      js: 'resources/scripts/*.js',
      img: 'resources/images/**/*.*'
    },
    watch: {
      html: 'resources/views/**/*.jade',
      css: 'resources/styles/**/*.scss',
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
      pretty: false
    }))
    .pipe(prettify({indentSize: 2}))
    .pipe(gulp.dest(path.build.html))
    .pipe(notify(("Файл <%= file.relative %> изменен!")));
});

// Запуск компиляции CSS из SCSS
gulp.task('css', function() {
  gulp.src(path.src.css)
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
  return gulp.src(path.src.js)
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
  var styles = gulp.src(bower({group: 'css'}))
    .pipe(plumber())
    .pipe(csso())
    .pipe(rename(function (path) {
      path.basename += ".min"
    }))
    .pipe(gulp.dest(path.build.css))
    .pipe(notify(("Файл <%= file.relative %> сжат!")));

  var scripts = gulp.src(bower({group: 'js'}))
    .pipe(plumber())
    .pipe(compressjs())
    .pipe(rename(function (path) {
      path.basename += ".min"
    }))
    .pipe(gulp.dest(path.build.js))
    .pipe(notify(("Файл <%= file.relative %> сжат!")));

  return styles, scripts;
});

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