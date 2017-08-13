let path = require('path');

/* Setting global dirs variables */
global.__root = path.resolve(__dirname);
global.__src = path.join(__root, "src");
global.__project_templates = path.join(__root, "project_templates");
global.__build_files_templates = path.join(__root, "build_files_templates");

let fs = require('fs');
let exec = require('child_process').exec;

let gulp = require('gulp');
let gutil = require('gulp-util');
let inquirer = require('inquirer');
let argv = require('minimist')(process.argv.slice(2));
let _ = require('lodash');

let Utils = require('./src/Utils.class');

// Load generators during slushfile.js bootstrap
var generators = [];
fs.readdirSync(path.join(__src, "generators")).forEach((el) => {
  try {
      let gen = require(path.join(__src, "generators", el, "main.js"));
      if (_.isString(gen.name) && _.isFunction(gen.generate) && (_.hasIn(argv, "hidden") || !_.hasIn(gen, "hidden") || gen.hidden == false))
          generators.push({name: gen.name, value: gen});
  } catch (e) {
      console.error(e)
  }
});

function start(done) {
    var project_info = {};

    var base = process.cwd();
    // the project root is derived from the event
    if (fs.lstatSync(base).isDirectory()) {
        project_info.root_dir = base;
    } else {
        done(new gutil.PluginError('new', '\'' + base + '\' is not a directory.'))
    }

    if (!Utils.checkIfDirIsEmpty(project_info.root_dir))
        done(new gutil.PluginError('new', 'A project already exists! Please remove it first.'));

    inquirer.prompt([
        {name: 'name', message: 'Project name:', default: path.basename(base)},
        {type: 'list', name: 'generator', message: 'Choose the generator you want to run: ', choices: generators}
    ]).then((answers) => {
        project_info.project_name = answers.name.replace(" ", "-");
        console.log("\nStarted generator " + gutil.colors.cyan(answers.generator.name));
        if (answers.generator.description)
            console.log(gutil.colors.cyan(answers.generator.description));
        console.log();
        answers.generator.generate(project_info, done);
    });
}

// Declare gulp tasks

gulp.task('git', function (done) {
  exec('git init', function (error) {
    if (error) {
      throw error;
    }
    done();
  });
});

if (_.hasIn(argv, "nogit"))
    gulp.task('new', function (done) {
        start(done);
    });
else
    gulp.task('new', ["git"], function (done) {
        start(done);
    });

gulp.task('default', ['new']);


