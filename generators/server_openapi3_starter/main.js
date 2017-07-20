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
    name: "Server OpenAPI project",
    generate: function (project_info, done) {
        Utils.processLanguage(languagesMetadata).then(result => {
            return Promise.all([result, Utils.processQuestions({
                type: 'input',
                name: 'openapispec',
                message: "Choose the OpenAPI Specification (2.0 spec will be automatically converted to 3.0 spec): "
            })])
        }).then(results => {
            return Promise.all([...results, deref.bundle(results[1].openapispec)]);
        }).then(results => {
            let load = new Promise((resolve, reject) => {
                oasConverter.convert(results[2], {}, (err, result) => {
                    if (err)
                        reject(err);
                    else
                        resolve(result.openapi)
                })
            });
            return Promise.all([...results, load])
        }).then(results => {
            let language = results[0].language;
            let build_tool = results[0].build_tool;
            let spec_path = results[1].openapispec;
            let spec_filename = path.basename(spec_path, path.extname(spec_path)) + ".json";
            let oas = results[3];
            let oasSerializable = _.cloneDeep(oas);

            if (!oasValidator.validateSync(oas, {}))
                done(new gutil.PluginError('new', "OpenAPI 3 spec not valid!"));

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
                openapispec_filename: spec_filename
            };

            if (securitySchemas)
                info.security_schemas = _.values(securitySchemas); // Convert from object to array

            srcFiles.push(templatesFunctions.main(info));
            srcPaths.push(language.templates.main);

            let buildFiles = buildFilesTemplatesFunctions.map((template) => template(project_info));

            Utils.writeFilesSync(srcPaths, srcFiles, language.src_dir);
            Utils.writeFilesSync(build_tool.templates, buildFiles);

            fs.mkdirpSync(language.resources_dir);
            Utils.writeFilesSync([path.join(language.resources_dir, spec_filename)], [JSON.stringify(oasSerializable)]);
            done();
        }).catch(error => done(new gutil.PluginError('new', error)));
    }
};
