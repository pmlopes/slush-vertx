/**
 * This task will setup a new project:
 * 
 * Questions: What is the prefered language?
 * 
 * Depending on the response will pick the possible build tools, if there is just one, then automatically select that one.
 * 
 * Questions: What is the prefered build tool?
 * 
 * Generate the project structure.
 */
'use strict';

var path = require('path');
var gulp = require('gulp');
var handlebars = require('gulp-compile-handlebars');
var install = require('gulp-install')
var conflict = require('gulp-conflict');
var metadata = require('../metadata');

var mapping = {
  java: ['maven', 'gradle'],
  groovy: ['gradle', 'maven'],
  js: ['npm'],
  kotlin: ['gradle', 'maven'],
  scala: ['sbt']
};

function validateProject() {
  if (metadata.language !== 'java') {
    metadata.dependencies.push({
      group: 'io.vertx',
      artifact: 'vertx-lang-' + metadata.language,
      version: '3.4.1'
    });
  }
}

module.exports = {
  id: 'project',
  depends: ['git-init', 'verticle'],
  task: function (done) {
    // the default project name is derived from the project root path
    var base = process.cwd();
    // project data
    metadata.root = base;

    metadata.prompt('projectName', 'Project name:', path.basename(base), function () {

      metadata.select('language', 'Which language:', Object.keys(mapping), function () {
        // we add a extra property with the language name as the key
        metadata[metadata.language] = true;

        metadata.select('buildtool', 'Which build tool:', mapping[metadata.language], function () {
          // validate the project name based on the build tool/language
          validateProject();

          // start the pipeline
          gulp
            .src(__dirname + '/templates/' + metadata.buildtool + '/**')
            .pipe(handlebars(metadata))
            .pipe(conflict(metadata.root))
            .pipe(gulp.dest(metadata.root))
            .pipe(install())
            .on('end', done)
            .resume();
        });
      });
    });
  }
}
