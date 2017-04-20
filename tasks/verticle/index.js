/**
 * This task will create a new verticle:
 * 
 * Questions: What is the prefered language?
 */
'use strict';

var gulp = require('gulp');
var handlebars = require('gulp-compile-handlebars');
var install = require('gulp-install')
var conflict = require('gulp-conflict');
var metadata = require('../metadata');
var rename = require('gulp-rename');

var languages = {
  java: { fqcn: true, target: 'src/main/java', extension: 'java' },
  groovy: { fqcn: false, target: 'src/main/resources/main.groovy', extension: 'groovy' },
  js: { fqcn: false, target: 'src/main/resources/main.js', extension: 'js' },
  kotlin: { fqcn: true, target: 'src/main/kotlin', extension: 'kt' },
  scala: { fqcn: true, target: 'src/main/scala', extension: 'scala' },
  ruby: { fqcn: false, target: 'src/main/resources/main.rb', extension: 'rb' },
};

module.exports = {
  id: 'verticle',
  depends: [],
  task: function (done) {
    // the default project name is derived from the project root path
    var base = process.cwd();
    // project data
    metadata.root = base;

    metadata.select('language', 'Which language:', Object.keys(languages), function () {
      // we add a extra property with the language name as the key
      metadata[metadata.language] = true;

      // if the language requires a fqcn we need to ask for class name and package
      if (languages[metadata.language].fqcn) {
        metadata.prompt('verticleName', 'Verticle name:', 'MainVerticle', function () {
          metadata.prompt('groupId', 'Package name:', undefined, function () {
            metadata.mainVerticle = metadata.groupId + '.' + metadata.verticleName;

            generate(languages[metadata.language].target + '/' + metadata.groupId.replace('\.', '/') + '/' + metadata.verticleName + '.' + languages[metadata.language].extension);
          });
        });
      } else {
        metadata.mainVerticle = 'main.' + languages[metadata.language].extension;
        generate(languages[metadata.language].target);
      }

      var generate = function (target) {
        // start the pipeline
        gulp
          .src(__dirname + '/templates/verticle.' + languages[metadata.language].extension)
          .pipe(handlebars(metadata))
          .pipe(rename(target))
          .pipe(conflict(metadata.root))
          .pipe(gulp.dest(metadata.root))
          .pipe(install())
          .on('end', done)
          .resume();
      };
    });
  }
}
