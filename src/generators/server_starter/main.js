var fs = require('fs');
var path = require('path');
var Handlebars = require('handlebars');

let Utils = require('../../Utils.class');
let constants = require('../../constants');
let metadata = require('../../common_metadata');

let languagesMetadata = [
    {
        name: "java",
        build_tools: [
            metadata.build_tools.gradle,
            metadata.build_tools.maven
        ],
        templates: [
            "MainVerticle.java"
        ],
        dependencies: metadata.dependencies.java_dependencies,
        questions: [
            metadata.questions.package
        ],
        var_templates: {
            package: metadata.var_templates.package,
            main: metadata.var_templates.main_class,
            src_dir: metadata.var_templates.src_dir
        }
    },
    // { // TODO
    //     name: "javascript",
    //     build_tools: [
    //         build_tools.npm
    //     ],
    //     dependencies: [
    //         {
    //             group: "io.vertx",
    //             artifact: "vertx-core",
    //             version: constants.VERTX_VERSION
    //         },
    //         {
    //             group: "io.vertx",
    //             artifact: "vertx-lang-js",
    //             version: constants.VERTX_VERSION
    //         }
    //     ],
    //     templates: [
    //         path.join("src", "main", "javascript", "main.js")
    //     ],
    //     src_dir: "src"
    // },
    {
        name: "groovy",
        build_tools: [
            metadata.build_tools.gradle,
            metadata.build_tools.maven
        ],
        templates: [
            "MainVerticle.groovy"
        ],
        dependencies: metadata.dependencies.groovy_dependencies,
        questions: [
            metadata.questions.package
        ],
        var_templates: {
            package: metadata.var_templates.package,
            main: metadata.var_templates.main_class,
            src_dir: metadata.var_templates.src_dir
        }
    },
    {
        name: "ruby",
        build_tools: [
            metadata.build_tools.gradle,
            metadata.build_tools.maven
        ],
        templates: [
            "main.rb"
        ],
        dependencies: metadata.dependencies.ruby_dependecies,
        main: "main.rb",
        src_dir: path.join("src", "main", "ruby")
    },
    {
        name: "kotlin",
        build_tools: [
            metadata.build_tools.maven
        ],
        templates: [
            "MainVerticle.kt"
        ],
        dependencies: metadata.dependencies.kotlin_dependencies,
        questions: [
            metadata.questions.package
        ],
        var_templates: {
            package: metadata.var_templates.package,
            main: metadata.var_templates.main_class,
            src_dir: metadata.var_templates.src_dir
        }
    }
];

module.exports = {
    name: "Starter project",
    generate: function (project_info, done) {
        Utils.processLanguage(languagesMetadata).then((result) => {
            let language = result.language;
            let build_tool = result.build_tool;

            let templatesFunctions = Utils.loadLanguageTemplates("server_starter", language.name, language.templates);
            let buildFilesTemplatesFunctions = Utils.loadBuildFilesTemplates(build_tool.name, build_tool.templates);

            project_info = Utils.buildProjectObject(project_info, language, build_tool);

            let srcFiles = templatesFunctions.map((template) => template(project_info));
            let buildFiles = buildFilesTemplatesFunctions.map((template) => template(project_info));

            Utils.writeFilesSync(language.templates, srcFiles, language.src_dir);
            Utils.writeFilesSync(build_tool.templates, buildFiles);

            done();
        });
    }
};
