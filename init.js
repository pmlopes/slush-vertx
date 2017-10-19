let path = require('path');
let fs = require('fs');
let _ = require('lodash');

/* Setting global dirs variables */
global.__root = path.resolve(__dirname);
global.__src = path.join(__root, "src");
global.__project_templates = path.join(__root, "project_templates");
global.__build_files_templates = path.join(__root, "build_files_templates");

/* Load generators manager */
require('./src/GeneratorsManager');