let fs = require('fs-extra');
let path = require('path');
let _ = require('lodash');
let gutil = require('gulp-util');
let deref = require('json-schema-ref-parser');

let Utils = require('../../Utils.class');
let OAS3Utils = require('../../openapi/OAS3Utils.class');
let constants = require('../../constants');
let metadata = require('../../common_metadata');

let clientGenerator = require(path.join(__src, "generators", "client_openapi_class_generator", "main.js")).generateWithoutPrompt;

let languagesMetadata = [
    {
        name: "java",
        build_tools: [
            metadata.build_tools.gradle,
            metadata.build_tools.maven
        ],
        templates:
        {
            client: "ApiClient.java"
        },
        resources_dir: "src/resources",
        dependencies: _.concat(metadata.dependencies.java_dependencies, [
            {
                group: "io.vertx",
                artifact: "vertx-web",
                version: constants.VERTX_VERSION
            },
            {
                group: "io.vertx",
                artifact: "vertx-web-api-contract",
                version: constants.VERTX_VERSION
            }
        ]),
        questions: [
            metadata.questions.package
        ],
        var_templates: {
            package: metadata.var_templates.package,
            main: metadata.var_templates.main_class,
            src_dir: metadata.var_templates.src_dir
        }
    },
    // {
    //     name: "kotlin",
    //     build_tools: [
    //         metadata.build_tools.maven
    //     ],
    //     templates:
    //         {
    //             main: "MainVerticle.kt",
    //             handler: "Handler.kt",
    //             security_handler: "SecurityHandler.kt"
    //         },
    //     resources_dir: "src/resources",
    //     dependencies: _.concat(metadata.dependencies.java_dependencies, [
    //         {
    //             group: "io.vertx",
    //             artifact: "vertx-web",
    //             version: constants.VERTX_VERSION
    //         },
    //         {
    //             group: "io.vertx",
    //             artifact: "vertx-web-api-contract",
    //             version: constants.VERTX_VERSION
    //         }
    //     ]),
    //     questions: [
    //         metadata.questions.package
    //     ],
    //     var_templates: {
    //         package: metadata.var_templates.package,
    //         main: metadata.var_templates.main_class,
    //         src_dir: metadata.var_templates.src_dir
    //     }
    // },
    // {
    //     name: "groovy",
    //     build_tools: [
    //         metadata.build_tools.gradle,
    //         metadata.build_tools.maven
    //     ],
    //     templates:
    //         {
    //             main: "MainVerticle.groovy",
    //             handler: "Handler.groovy",
    //             security_handler: "SecurityHandler.groovy"
    //         },
    //     resources_dir: "src/resources",
    //     dependencies: _.concat(metadata.dependencies.groovy_dependencies, [
    //         {
    //             group: "io.vertx",
    //             artifact: "vertx-web",
    //             version: constants.VERTX_VERSION
    //         },
    //         {
    //             group: "io.vertx",
    //             artifact: "vertx-web-api-contract",
    //             version: constants.VERTX_VERSION
    //         }
    //     ]),
    //     questions: [
    //         metadata.questions.package
    //     ],
    //     var_templates: {
    //         package: metadata.var_templates.package,
    //         main: metadata.var_templates.main_class,
    //         src_dir: metadata.var_templates.src_dir
    //     }
    // },
];

module.exports = {
    name: "Client OpenAPI project",
    generate: function (project_info, done) {
        Utils.processLanguage(languagesMetadata).then(result => {
            return Promise.all([result, Utils.processQuestions({
                type: 'input',
                name: 'openapispec',
                message: "Choose the OpenAPI Specification (2.0 spec will be automatically converted to 3.0 spec): "
            })])
        }).then(results => {
            return Promise.all([...results, OAS3Utils.resolveOpenAPISpec(results[1].openapispec, true)]);
        }).then(results => {
            let language = results[0].language;
            let build_tool = results[0].build_tool;
            let spec_path = results[1].openapispec;
            let spec_filename = path.basename(spec_path, path.extname(spec_path)) + ".json";
            let oas = results[2][1];
            let oasSerializable = results[2][0];
            let docTemplates = ["README.md", "Operations.md"];

            project_info = Utils.buildProjectObject(project_info, language, build_tool);
            let info = clientGenerator(project_info, oas);

            let docTemplatesFunctions = Utils.loadGeneratorTemplates(docTemplates, "client_openapi_generator");
            let docFiles = _.mapValues(docTemplatesFunctions, (template) => template(info));

            let buildFilesTemplatesFunctions = Utils.loadBuildFilesTemplates(build_tool.templates, build_tool.name);
            let buildFiles = buildFilesTemplatesFunctions.map((template) => template(project_info));

            Utils.writeFilesSync(docTemplates, docFiles);
            Utils.writeFilesSync(build_tool.templates, buildFiles);

            Utils.writeFilesSync([path.join(language.resources_dir, spec_filename)], [JSON.stringify(oasSerializable)]);

            done();
        }).catch(error => done(new gutil.PluginError('new', error.stack)));
    }
};
