var fs = require('fs');
var path = require('path');
var Handlebars = require('handlebars');
var constants = require("../constants");

var Utils = require('../Utils.class');

module.exports = {
    name: "Server OpenAPI 3 project",
    generate: function (project_info, done) {
        Utils.processLanguage(languagesMetadata).then((language, build_tool) => {
            let templatesFunctions = Utils.loadLanguageTemplates("server_starter", language.name, language.templates);
            let buildFilesTemplatesFunctions = Utils.loadBuildFilesTemplates(build_tool.name, build_tool.templates);

            project_info.language = language;
            project_info.build_tool = build_tool;

            let srcFiles = templatesFunctions.map((template) => template(project_info));
            let buildFiles = buildFilesTemplatesFunctions.map((template) => template(project_info));

            Utils.writeFilesSync(srcFiles, language.templates, language.src_dir);
            Utils.writeFilesSync(buildFiles, build_tool.templates);

            done();
        });
    }
};
