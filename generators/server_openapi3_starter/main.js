let fs = require('fs-extra');
let path = require('path');
let Handlebars = require('handlebars');
let ajv = new require('ajv')();
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
let deref = require('json-schema-ref-parser');
let _ = require('lodash');
var gutil = require('gulp-util');

let Utils = require('../../Utils.class');
let OAS3Utils = require('../../OAS3Utils.class');
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
            main: "MainVerticle.java",
            handler: "Handler.java",
            security_handler: "SecurityHandler.java"
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
    {
        name: "kotlin",
        build_tools: [
            metadata.build_tools.maven
        ],
        templates:
            {
                main: "MainVerticle.kt",
                handler: "Handler.kt",
                security_handler: "SecurityHandler.kt"
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
    {
        name: "groovy",
        build_tools: [
            metadata.build_tools.gradle,
            metadata.build_tools.maven
        ],
        templates:
            {
                main: "MainVerticle.groovy",
                handler: "Handler.groovy",
                security_handler: "SecurityHandler.groovy"
            },
        resources_dir: "src/resources",
        dependencies: _.concat(metadata.dependencies.groovy_dependencies, [
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
];

module.exports = {
    name: "Server OpenAPI 3 project",
    generate: function (project_info, done) {
        let validateOpenAPI = ajv.compile(require('./openapi3_schema.json'));
        Utils.processLanguage(languagesMetadata).then((result) => {
            Utils.processQuestions({type: 'input', name: 'openapispec', message: "Choose the OpenAPI 3 Specification: "}).then((answer) => {
                deref.dereference(answer.openapispec).then((oas) => {
                    let openapispec_filename = path.basename(answer.openapispec, path.extname(answer.openapispec)) + ".json";

                    // var valid = validateOpenAPI(oas);
                    // TODO waiting for working oas 3 schema
                    // if (!valid)
                    //     done(new gutil.PluginError('new', validateOpenAPI.errors));
                    if (!oas.openapi.match(/^3\./g))
                        done(new gutil.PluginError('new', "Only OpenAPI 3 specs allowed"));

                    let language = result.language;
                    let build_tool = result.build_tool;

                    let templatesFunctions = Utils.loadLanguageTemplates("server_openapi3_starter", language.name, language.templates);
                    let buildFilesTemplatesFunctions = Utils.loadBuildFilesTemplates(build_tool.name, build_tool.templates);

                    project_info = Utils.buildProjectObject(project_info, language, build_tool);
                    project_info.oas = oas;

                    operations = OAS3Utils.getPathsByOperationIds(oas);

                    let srcFiles = [];
                    let srcPaths = [];

                    Object.keys(operations).forEach(key => {
                        let class_name = OAS3Utils.getClassNameFromOperationId(key, "Handler");
                        operations[key].class_name = class_name;

                        let info = {
                            project_info: project_info,
                            operation: operations[key],
                            class_name: class_name
                        };

                        if (!_.isEmpty(operations[key].parameters) || !_.isEmpty(operations[key].requestBody))
                            info.renderParams = true;

                        srcFiles.push(templatesFunctions.handler(info));
                        srcPaths.push(path.join("handlers", class_name + path.extname(language.templates.handler)))
                    });

                    let securitySchemas = _.get(oas, 'components.securitySchemes');
                    if (securitySchemas) {
                        Object.keys(securitySchemas).forEach(key => {
                            let class_name = OAS3Utils.getClassNameFromOperationId(key, "SecurityHandler");
                            securitySchemas[key].class_name = class_name;

                            securitySchemas[key].schema_name = key;

                            let info = {
                                project_info: project_info,
                                security_schema: securitySchemas[key],
                                class_name: class_name
                            };

                            srcFiles.push(templatesFunctions.security_handler(info));
                            srcPaths.push(path.join("securityHandlers", class_name + path.extname(language.templates.security_handler)))
                        });
                    }

                    let info = {
                        project_info: project_info,
                        operations: operations,
                        openapispec_filename: openapispec_filename
                    };

                    if (securitySchemas)
                        info.security_schemas = _.values(securitySchemas); // Convert from object to array

                    srcFiles.push(templatesFunctions.main(info));
                    srcPaths.push(language.templates.main);

                    let buildFiles = buildFilesTemplatesFunctions.map((template) => template(project_info));

                    Utils.writeFilesSync(srcPaths, srcFiles, language.src_dir);
                    Utils.writeFilesSync(build_tool.templates, buildFiles);

                    deref.bundle(answer.openapispec).then((oasSerializable) => {
                        fs.mkdirpSync(language.resources_dir);
                        Utils.writeFilesSync([path.join(language.resources_dir, openapispec_filename)], [JSON.stringify(oasSerializable)]);
                        done();
                    });
                });
            });
        });
    }
};
