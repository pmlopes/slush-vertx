let fs = require('fs');
let path = require('path');
let Handlebars = require('handlebars');
let _ = require('lodash');

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

//This function load and render templates
function render(project_info) {
    // Load templates
    let templatesFunctions = Utils.loadGeneratorTemplates(project_info.templates, "server_starter", project_info.language);
    let buildFilesTemplatesFunctions = Utils.loadBuildFilesTemplates(project_info.build_tool.templates, project_info.build_tool.name);

    // Some lodash magic
    return _.concat(
        _.zipWith(
            project_info.templates.map(p => path.join(project_info.src_dir, p)), // Prepend to paths the src_dir path
            templatesFunctions.map(template => template(project_info)), // Render templates
            (path, content) => new Object({path: path, content: content}) // Push into the array in a form {path: path, content: content}
            ),
        _.zipWith(
            project_info.build_tool.templates,
            buildFilesTemplatesFunctions.map(template => template(project_info)),
            (path, content) => new Object({path: path, content: content})
        )
    )
}

module.exports = {
    name: "Starter project",
    generate: function (project_info, done) {
        // Process questions about the language
        Utils.processLanguage(languagesMetadata, project_info).then((result) => {
            //Transform project info and render templates
            let files = render(result.project_info);

            //Write files
            Utils.writeFilesArraySync(files);

            done();
        });
    },
    render: render
};
