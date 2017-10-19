require('./init');

let path = require('path');
let fs = require('fs');
let exec = require('child_process').exec;

let gulp = require('gulp');
let gutil = require('gulp-util');
let inquirer = require('inquirer');
let argv = require('minimist')(process.argv.slice(2));
let _ = require('lodash');

let Utils = require('./src/Utils.class');

function start(done) {
    //TODO CLEAN THAT CODE
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
    //TODO-------------------------

    let generators = __generators
        .filter(value => _.hasIn(gen, "hidden") || !_.hasIn(gen, "hidden") || gen.hidden == false) //TODO Maybe i need to rewrite it?
        .map(gen => ({name: gen.name, value: gen}));


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


