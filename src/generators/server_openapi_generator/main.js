let fs = require('fs-extra');
let path = require('path');
let _ = require('lodash');
let gutil = require('gulp-util');

let Utils = require('../../Utils.class');
let OAS3Utils = require('../../openapi/OAS3Utils.class');
let constants = require('../../constants');
let metadata = require('../../common_metadata');

let clientMetadata = require(path.join(__src, "generators", "client_openapi_class_generator", "main.js")).metadata;

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
            security_handler: "SecurityHandler.java",
            operation_test: "OperationTest.java",
            client: "ApiClient.java",
            base_test: "BaseTest.java"
        },
        resources_dir: metadata.resources_dir,
        dependencies: _.concat(
            metadata.dependencies.java_dependencies,
            metadata.dependencies.java_test_dependencies,
            metadata.dependencies.vertx_test_dependencies,
            [
                {
                    group: "io.vertx",
                    artifact: "vertx-web",
                    version: constants.VERTX_VERSION
                },
                {
                    group: "io.vertx",
                    artifact: "vertx-web-api-contract",
                    version: constants.VERTX_VERSION
                },
                {
                    group: "io.vertx",
                    artifact: "vertx-web-client",
                    version: constants.VERTX_VERSION,
                    test: true
                }
            ]
        ),
        questions: [
            metadata.questions.package
        ],
        var_templates: {
            package: metadata.var_templates.package,
            main: metadata.var_templates.main_class,
            src_dir: metadata.var_templates.src_dir,
            test_dir: metadata.var_templates.test_dir
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
                security_handler: "SecurityHandler.kt",
                operation_test: "OperationTest.kt",
                client: "ApiClient.kt",
                base_test: "BaseTest.kt"
            },
        resources_dir: metadata.resources_dir,
        dependencies: _.concat(
            metadata.dependencies.kotlin_dependencies,
            metadata.dependencies.kotlin_test_dependencies,
            metadata.dependencies.vertx_test_dependencies,
            [
                {
                    group: "io.vertx",
                    artifact: "vertx-web",
                    version: constants.VERTX_VERSION
                },
                {
                    group: "io.vertx",
                    artifact: "vertx-web-api-contract",
                    version: constants.VERTX_VERSION
                },
                {
                    group: "io.vertx",
                    artifact: "vertx-web-client",
                    version: constants.VERTX_VERSION,
                    test: true
                }
            ]
        ),
        questions: [
            metadata.questions.package
        ],
        var_templates: {
            package: metadata.var_templates.package,
            main: metadata.var_templates.main_class,
            src_dir: metadata.var_templates.src_dir,
            test_dir: metadata.var_templates.test_dir
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
                security_handler: "SecurityHandler.groovy",
                client: "ApiClient.groovy",
                base_test: "BaseTest.groovy",
                operation_test: "OperationTest.groovy"
            },
        resources_dir: metadata.resources_dir,
        dependencies: _.concat(
            metadata.dependencies.groovy_dependencies,
            metadata.dependencies.java_test_dependencies,
            metadata.dependencies.vertx_test_dependencies,
            [
                {
                    group: "io.vertx",
                    artifact: "vertx-web",
                    version: constants.VERTX_VERSION
                },
                {
                    group: "io.vertx",
                    artifact: "vertx-web-api-contract",
                    version: constants.VERTX_VERSION
                },
                {
                    group: "io.vertx",
                    artifact: "vertx-web-client",
                    version: constants.VERTX_VERSION,
                    test: true
                }
            ]
        ),
        questions: [
            metadata.questions.package
        ],
        var_templates: {
            package: metadata.var_templates.package,
            main: metadata.var_templates.main_class,
            src_dir: metadata.var_templates.src_dir,
            test_dir: path.join("src", "test", "groovy")
        }
    },
];

function render(project_info) {
    let result = [];

    let renderClient = Utils.loadSingleTemplate(project_info.templates.client, "client_openapi_class_generator", project_info.language);
    let templatesFunctions = Utils.loadGeneratorTemplates(project_info.templates, "server_openapi_generator", project_info.language);
    let buildFilesTemplatesFunctions = Utils.loadBuildFilesTemplates(project_info.build_tool.templates, project_info.build_tool.name);

    // Generate operations handlers
    let operations = OAS3Utils.getPathsByOperationIds(project_info.oas);
    _.forOwn(operations, (operation, key) => {
        operation.class_name = OAS3Utils.getClassNameFromOperationId(key, "Handler");

        let handler_info = {
            project_info: project_info,
            operation: operations[key]
        };
        if (!_.isEmpty(operations[key].parameters) || !_.isEmpty(operations[key].requestBody)) handler_info.renderParams = true;

        result.push({
            path: path.join(project_info.src_dir, "handlers", operation.class_name + path.extname(project_info.templates.handler)),
            content: templatesFunctions.handler(handler_info)
        });
    });

    // Generate security schema handlers
    let securitySchemas = _.get(project_info.oas, 'components.securitySchemes');
    if (securitySchemas) {
        _.forOwn(securitySchemas, (securitySchema, key) => {
            securitySchema.class_name = OAS3Utils.getClassNameFromOperationId(key, "SecurityHandler");
            securitySchema.schema_name = key;

            let security_handler_info = {
                project_info: project_info,
                security_schema: securitySchema
            };

            result.push({
                path: path.join(project_info.src_dir, "securityHandlers", securitySchema.class_name + path.extname(project_info.templates.security_handler)),
                content: templatesFunctions.security_handler(security_handler_info)
            });
        });
    }

    // Generate unit test
    if (project_info.templates.operation_test) {
        // Generate client
        let client_info = clientMetadata(project_info);
        result.push({
            path: path.join(project_info.test_dir, project_info.templates.client),
            content: renderClient(client_info)
        });

        // Use client metadata for unit tests (I basically need function names)
        // Some language (like Java) has a parent class for all test classes with some shared code (like test initializer)
        if (project_info.templates.base_test)
            result.push({
                path: path.join(project_info.test_dir, project_info.templates.base_test),
                content: templatesFunctions.base_test(client_info)
            });
        _.forOwn(client_info.operations, (operation, key) => {
            operation.test_class_name = OAS3Utils.getClassNameFromOperationId(key, "Test");
            _.forOwn(operation.responses, (response, statusCode) => {
                response.status_code = statusCode;
            });
            result.push({
                path: path.join(project_info.test_dir, operation.test_class_name + path.extname(project_info.templates.operation_test)),
                content: templatesFunctions.operation_test({
                    project_info: project_info,
                    operation: operation
                })
            });
        });
    }

    // Generate main verticle
    let main_info = {
        project_info: project_info,
        operations: operations
    };
    if (securitySchemas)
        main_info.security_schemas = _.values(securitySchemas); // Convert from object to array

    result.push({
        path: path.join(project_info.src_dir, project_info.templates.main),
        content: templatesFunctions.main(main_info)
    });

    // Some lodash magic
    return _.concat(
        // Source files
        result,
        // OpenAPI spec
        {
            path: path.join(project_info.resources_dir, project_info.spec_filename),
            content: JSON.stringify(project_info.oasSerializable)
        },
        // Build files
        _.zipWith(
            project_info.build_tool.templates,
            buildFilesTemplatesFunctions.map(template => template(project_info)),
            (path, content) => new Object({path: path, content: content})
        )
    )
}

module.exports = {
    name: "Vert.x Web Server OpenAPI project",
    description: "Generate a skeleton based on Swagger 2/OpenAPI 3 specification with sources and tests for Vert.x 3 Web powered REST server\n" +
    "The project generated will use vertx-web-api-contract-openapi to generate the Router and validate the requests",
    generate: function (project_info, done) {
        Utils.processLanguage(languagesMetadata, project_info).then(result => {
            return Promise.all([result, Utils.processQuestions({
                type: 'input',
                name: 'openapispec',
                message: "Choose the OpenAPI Specification (2.0 spec will be automatically converted to 3.0 spec): "
            })])
        }).then(results => {
            return Promise.all([...results, OAS3Utils.resolveOpenAPISpec(results[1].openapispec, true)]);
        }).then(results => {
            // Build project_info object
            let project_info = results[0].project_info;
            project_info.spec_path = results[1].openapispec;
            project_info.spec_filename = path.basename(project_info.spec_path, path.extname(project_info.spec_path)) + ".json";
            project_info.oas = results[2][1];
            project_info.oasSerializable = results[2][0];

            let files = render(project_info);

            //Write files
            Utils.writeFilesArraySync(files);

            done();
        }).catch(error => done(new gutil.PluginError('new', error.stack)));
    },
    render: render
};
