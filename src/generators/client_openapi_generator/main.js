let fs = require('fs-extra');
let path = require('path');
let Handlebars = require('handlebars');
// let ajv = new require('ajv')();
// ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
let deref = require('json-schema-ref-parser');
let _ = require('lodash');
let gutil = require('gulp-util');
let oasConverter = require('swagger2openapi');
let oasValidator = require('swagger2openapi/validate.js');

let Utils = require('../../Utils.class');
let OAS3Utils = require('../../openapi/OAS3Utils.class');
let constants = require('../../constants');
let metadata = require('../../common_metadata');

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
            project_info = Utils.buildProjectObject(project_info, results[0].language, results[0].build_tool);
            require("../client_openapi_class_generator/main")
                .generateWithoutPrompt(project_info, results[1].openapispec, done);
        }).catch(error => done(new gutil.PluginError('new', error)));
    }
};
