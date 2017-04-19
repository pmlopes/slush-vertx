var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var gulp = require('gulp');
var inquirer = require('inquirer');

var metadata = require('./metadata.json');
var generator = require('./generator');

// extract the build tools from the metadata
var buildToolIds = [];

metadata.forEach(function (el) {
  if (buildToolIds.indexOf(el.buildtool) === -1) {
    buildToolIds.push(el.buildtool);
  }
});

gulp.task('git', function (done) {
  exec('git init', function (error) {
    if (error) {
      throw error;
    }

    done();
  });
});

gulp.task('new', ['git'], function (done) {

  // this is a small helper that will avoid interaction with user
  // if there is just a single element on the list
  var showQuickPick = function (message, list, callback) {
    if (list.length > 1) {
      inquirer.prompt({ name: 'anwser', message: message, type: 'list', choices: list }, function (anwser) {
        callback(anwser.anwser);
      });
    } else {
      callback(list[0]);
    }
  }

  var project = {};

  var base = process.cwd();
  // the project root is derived from the event
  if (fs.lstatSync(base).isDirectory()) {
    project.projectRoot = base;
  } else {
    throw new Error('\'' + base + '\' is not a directory.')
  }

  // if there is already a project file show warning and stop
  var projectAlreadyExists = ['pom.xml', 'build.gradle', 'package.json'].some(function (el) {
    return fs.existsSync(project.projectRoot + path.sep + el);
  });

  if (projectAlreadyExists) {
    throw new Error('A project already exists! Please remove it first.');
  }

  // the default project name is derived from the project root path
  inquirer.prompt({ name: 'projectName', message: 'Project name:', default: path.basename(base) }, function (answer) {
    project.projectName = answer.projectName;

    showQuickPick('Which build tool:', buildToolIds, function (buildtool) {
      // the selected build tool
      project.buildtool = buildtool;

      var templateIds = metadata.filter(function (el) {
        return el.buildtool === buildtool;
      }).map(function (el) {
        return el.id;
      });

      showQuickPick('Which language:', templateIds, function (template) {
        // the selected template
        project.template = template;
        // set a property with the used language
        project[template] = true;

        // locate the selected metadata and add to the project object
        project.metadata = metadata.filter(function (el) {
          return el.buildtool === project.buildtool && el.id === template;
        })[0];

        // set the correct main verticle
        project.mainVerticle = project.metadata.main.replace('{package}', project.projectName || '');

        generator.generate(project);
        done();
      });
    });
  });
});

gulp.task('default', ['new']);