var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var gulp = require('gulp');
var inquirer = require('inquirer');

var Utils = require('./Utils.class');

// Load generators
var generators = [];
fs.readdirSync(path.join(__dirname, "generators")).forEach((el) => {
  try {
      var gen = require(path.join(__dirname, "generators", el, "main.js"));
      if (gen.hasOwnProperty("name") && gen.hasOwnProperty("generate"))
          generators.push({name: gen.name, value: gen.generate});
  } catch (e) {
      console.error(e)
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

    var project_info = {};

    var base = process.cwd();
    // the project root is derived from the event
    if (fs.lstatSync(base).isDirectory()) {
        project_info.root_dir = base;
    } else {
        throw new Error('\'' + base + '\' is not a directory.')
    }

    if (!Utils.checkIfDirIsEmpty(project_info.root_dir))
        throw new Error('A project already exists! Please remove it first.');

    inquirer.prompt([
        {name: 'name', message: 'Project name:', default: path.basename(base)},
        {type: 'list', name: 'generator', message: 'Choose the generator you want to run: ', choices: generators}
    ]).then((answers) => {
        project_info.project_name = answers.name.replace(" ", "-");
        answers.generator(project_info, done);
    });
});

gulp.task('default', ['new']);
