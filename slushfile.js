var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var gulp = require('gulp');
var inquirer = require('inquirer');

var Utils = require('./Utils.class');


// extract the build tools from the metadata
/*var buildToolIds = [];

metadata.forEach(function (el) {
  if (buildToolIds.indexOf(el.buildtool) === -1) {
    buildToolIds.push(el.buildtool);
  }
});*/

// Load generators
var generators = [];
fs.readdirSync(path.join(__dirname, "generators")).forEach((el) => {
  var gen = require(path.join(__dirname, "generators", el));
  if (gen.hasOwnProperty("name") && gen.hasOwnProperty("generate"))
    generators.push({name: gen.name, value: gen.generate});
});

console.log(generators);

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

/*}), function (answer) {
      project_info.name = answer.projectName.replace(" ", "-");

  inquirer.prompt({ name: 'projectName', message: 'Project name:', default: path.basename(base) }, function (answer) {
    project_info.name = answer.projectName.replace(" ", "-");

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
});*/

gulp.task('default', ['new']);
