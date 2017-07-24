let fs = require('fs-extra');
let path = require('path');
let deref = require('json-schema-ref-parser');
let _ = require('lodash');
let gutil = require('gulp-util');
let oasConverter = require('swagger2openapi');

let Utils = require('../../Utils.class');
let OAS3Utils = require('../../openapi/OAS3Utils.class');
let constants = require('../../constants');

let clientGenerator = require(path.join(__src, "generators", "client_openapi_class_generator", "main.js")).generateWithoutPrompt;

module.exports = {
    name: "vertx-web-api-contract-openapi unit test generator",
    hidden: true,
    generate: (project_info, done) => {
        deref.bundle(path.join(__src, "generators", "vertx_web_unit_test_generator", "openapi.yaml")).then(result => {
            return new Promise((resolve, reject) => {
                oasConverter.convert(result, {}, (err, result) => {
                    if (err)
                        reject(err);
                    else
                        resolve(result.openapi)
                })
            });
        }).then(result => deref.dereference(result)). then((result) => {
            let oas = result;
            let java = {
                name: "java",
                templates:
                    {
                        client: "ApiClient.java",
                        test: "OpenAPI3ParametersUnitTest.java"
                    },
                resources_dir: "",
                package: "io.vertx.ext.web.designdriven.openapi3",
                src_dir: ""
            };
            project_info = Utils.buildProjectObject(project_info, java, {});

            let renderUnitTest = Utils.loadSingleTemplate("vertx_web_unit_test_generator", project_info.language, project_info.templates.test);

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

            clientGenerator(project_info, path.join(__src, "generators", "vertx_web_unit_test_generator", "openapi.yaml"), done);

        }).catch(error => done(new gutil.PluginError('new', error.stack)));

    }
};