/*================================================================
ПРОЧИТАЙ ИНСТРУКЦИЮ В ФАЙЛЕ: Readme_gulp_info.md
================================================================*/

//==============================
//Переменные с названием папок исходного проекта и конечного проекта
//--------------------------
let project_folder = "dist"; //название папки с результатами работы Gulp (можно присвоть путь папки проекта чтобы 
                             //папка с конечными файлами называлась так же как и папка всего проекта: 
                             //<< let project_folder = require("path").basename(__dirname); >>)
let source_folder = "#src"; //название папки в которой будем работать (исходники)
//--------------------------
//==============================

//==============================================================================
// ПЕРЕМЕННАЯ ПУТЕЙ К ФАЙЛАМ И ПАПКАМ
let path = { // переменная содержащая пути к исходникам, конечным файлам и др.
  build:{ // объект хранящий пути вывода конечных файлов и папок
    html: project_folder + "/", // HTML файлы
    css: project_folder + "/css/", // CSS файлы
    js: project_folder + "/js/", // Javascript файлы
    img: project_folder + "/img/", // изображения
    fonts: project_folder + "/fonts/" // шрифты
  },
  src:{ //объект хранящий пути к исходникам в которых ведется работа
    //----------------------------------------------------------
    // ** - слушаются все файлы во всех папках и подпапках пути
    //----------------------------------------------------------
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"], // HTML файлы
    css: source_folder + "/scss/style.scss", // CSS файлы
    js: source_folder + "/js/script.js", // Javascript файлы
    img: source_folder + "/img/**/*.{jpg, png, svg, gif, ico, webp}", // изображения
    fonts: source_folder + "/fonts/*.ttf" // шрифты
  },
  watch:{ // обьект постоянно слушающий изменения в файлах и папках проекта
          // налету (в браузере измененеия появляются сразу после сохранения)
    html: source_folder + "/**/*.html",
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.{jpg, png, svg, gif, ico, webp}"
  },
  clean: "./" + project_folder + "/" // обьект автоматически чисящий
                                     // все файлы в конечной папке
}
//==============================================================================


//==============================================================================
let {src, dest} = require('gulp'), // переменные которым присвоен сам Gulp
  gulp = require('gulp'), // переменная с присвоенным Gulp для других задач

// ниже объявленны переменные плагинов

//------------------------------------------------
  browsersync = require("browser-sync").create(); // обновление страницы
//------------------------------------------------
  fileinclude = require("gulp-file-include");
  del = require("del");
  scss = require("gulp-sass");
  autoprefixer = require("gulp-autoprefixer");
  group_media = require("gulp-group-css-media-queries");
  clean_css = require("gulp-clean-css");
  rename = require("gulp-rename");
  uglify = require("gulp-uglify-es").default;
  imagemin = require("gulp-imagemin");
  webp = require("gulp-webp");
//==============================================================================

//==============================================================================
// ФУНКЦИЯ ОБНОВЛЯЮЩАЯ СТРАНИЦУ
function browserSync(params) {
  browsersync.init({ // переменная с плагином
    // ниже обявленны настройки плагина
    server: { // настройка сервера
      baseDir: "./" + project_folder + "/" // указание базовой папки путь как
                                           //  в обьекте clean переменной path
    },
    port: 3000, // настройка порта
    notify: false // отключенеи таблички с информацией, что страница обновилась
  })
}
//==============================================================================


//==============================================================================
// ФУНКЦИЯ ДЛЯ РАБОТЫ С HTML
function html() {
  return src(path.src.html) // путь к исходникам
    .pipe(fileinclude()) // сборка HTML файлов в один
    .pipe(dest(path.build.html)) // путь к конечной папке через переменную
                                 // через переменную -- dest--

    .pipe(browsersync.stream())  // обновление страницы через переменную
                                 // плагина browser-sync
}
//==============================================================================

//==============================================================================
// ФУНКЦИЯ ОБРАБОТКИ ФАЙЛОВ СТИЛЕЙ
function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: "expanded"
      })
    )
    .pipe(
      group_media()
    )
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["Last 4 versions"],
        cascade: true
      })
    )
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(
      rename({
        extname: ".min.css"
      })
    )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}
//==============================================================================

//==============================================================================
// ФУНКЦИЯ ДЛЯ ОБРАБОТКИ СКРИПТОВЫХ ФАЙЛОВ
function js() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(
      uglify()
    )
    .pipe(
      rename({
        extname: ".min.js"
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
}
//==============================================================================

//==============================================================================
// ФУНКЦИЯ ДЛЯ ОБРАБОТКИ ИЗОБРАЖЕНИЙ
function images() {
  return src(path.src.img)
    .pipe(
      webp({
        quality: 70
      })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        interlaced: true,
        optimizationLevel: 3 // 0 to 7
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}
//==============================================================================

//==============================================================================
//ФУНКЦИЯ СЛЕДЯЩАЯ ЗА ИЗМЕНЕНИЕМ ФАЙЛОВ В ИСХОДНИКЕ
function watchFiles(params) {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}
//==============================================================================

//==============================================================================
//ФУНКЦИЯ ОЧИСТКИ КОНЕЧНОЙ ПАПКИ
function clean(params) {
  return del(path.clean);
}

//==============================================================================
// переменная --build-- запускает функции которые должны запускаться
let build = gulp.series(clean, gulp.parallel(js, css, html, images));

// перменная --watch-- запускает функции которые должны постоянно работать
let watch = gulp.parallel(build, watchFiles, browserSync);
//==============================================================================

//==============================================================================
// переменные для подключения к Gulp
// они берутся из переменных --build-- и --watch--
// объявленные выше
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
