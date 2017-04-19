var fs = require('fs');
var path = require('path');
var Handlebars = require('handlebars');

var cache = {};

function mkdirs(folderPath, mode) {
  var folders = [];
  var tmpPath = path.normalize(folderPath);
  var exists = fs.existsSync(tmpPath);
  while (!exists) {
    folders.push(tmpPath);
    tmpPath = path.join(tmpPath, '..');
    exists = fs.existsSync(tmpPath);
  }

  for (var i = folders.length - 1; i >= 0; i--) {
    fs.mkdirSync(folders[i], mode);
  }
}

function generate(project) {
  project.metadata.templates.forEach(function (el) {
    // process file name (replace package placeholder with real package, ignore placeholder for handlebars)
    var file = project.projectRoot + '/' + el.substr(el.indexOf('/') + 1).replace('{package}', project.projectName || '');
    var hbfile = __dirname + '/templates/' + el.replace('{package}/', '');

    var source, template;

    if (cache.hasOwnProperty(hbfile)) {
      source = cache[hbfile].source;
      template = cache[hbfile].template;
    } else {
      source = fs.readFileSync(hbfile, 'utf8');
      template = Handlebars.compile(source);
      cache[hbfile] = {
        source: source,
        template: template
      };
    }

    // ensure that the path where files need to be written already exist
    mkdirs(file.substring(0, file.lastIndexOf('/')));
    // write the file
    fs.writeFileSync(file, template(project), 'utf8');
  });
}

module.exports = {
  cache: cache,
  generate: generate
};
