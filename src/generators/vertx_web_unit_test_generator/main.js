let fs = require('fs-extra');
let path = require('path');
let _ = require('lodash');
let gutil = require('gulp-util');

let Utils = require('../../Utils.class');
let OAS3Utils = require('../../openapi/OAS3Utils.class');
let constants = require('../../constants');

let clientGenerator = require(path.join(__src, "generators", "client_openapi_class_generator", "main.js")).generateWithoutPrompt;

module.exports = {
    name: "vertx-web-api-contract-openapi unit test generator",
    hidden: true,
    generate: (project_info, done) => {
        OAS3Utils.resolveOpenAPISpec(path.join(__src, "generators", "vertx_web_unit_test_generator", "openapi.yaml")).then(result => {
            let oas = result[1];
            let java = {
                name: "java",
                templates:
                    {
                        client: "ApiClient.java",
                        test: "OpenAPI3ParametersUnitTest.java"
                    },
                package: "io.vertx.ext.web.designdriven.openapi3",
                src_dir: ""
            };
            project_info = Utils.buildProjectObject(project_info, java, {});

            let renderUnitTest = Utils.loadSingleTemplate(project_info.templates.test, "vertx_web_unit_test_generator", project_info.language);

            operations = OAS3Utils.getPathsByOperationIds(oas);

            Object.keys(operations).forEach(key => {
                operations[key].sanitized_operation_id = OAS3Utils.sanitizeOperationId(key);
                operations[key].parameters.forEach((e) => {
                    e.sanitized_name = OAS3Utils.sanitizeParameterName(e.name);
                    e.languageType = OAS3Utils.resolveType(project_info.language, e.schema.type, e.schema.format);
                });
                operations[key].exampleResponse = JSON.stringify(operations[key].responses['200'].content['application/json'].example);
            });

            let info = {
                project_info: project_info,
                operations: operations,
                oas: oas
            };

            Utils.writeFilesSync([project_info.templates.test], [renderUnitTest(info)], project_info.src_dir);

            clientGenerator(project_info, oas);

            done();

        }).catch(error => done(new gutil.PluginError('new', error.stack)));

    }
};