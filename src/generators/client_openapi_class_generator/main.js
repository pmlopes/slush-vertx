let fs = require('fs-extra');
let path = require('path');
let deref = require('json-schema-ref-parser');
let _ = require('lodash');
let gutil = require('gulp-util');
let oasConverter = require('swagger2openapi');
let oasValidator = require('swagger2openapi/validate.js');

let Utils = require('../../Utils.class');
let OAS3Utils = require('../../openapi/OAS3Utils.class');

var generateWithoutPrompt = function (project_info, oas_deferenced) {
    let oas = oas_deferenced;

    let renderClient = Utils.loadSingleTemplate(project_info.templates.client, "client_openapi_class_generator", project_info.language);

    operations = OAS3Utils.getPathsByOperationIds(oas);

    Object.keys(operations).forEach(key => {
        let baseFunctionName = OAS3Utils.sanitizeOperationId(key);

        let functions = [];

        if (!_.has(operations[key], "requestBody.content") || _.isEmpty(operations[key].requestBody.content)) {
            functions.push({name: baseFunctionName, empty: true});
        } else {
            functions.push({name: baseFunctionName + "WithEmptyBody", empty: true});
            _.forOwn(operations[key].requestBody.content, (value, key) => {
                if (key == "application/json")
                    functions.push({name: baseFunctionName + "WithJson", json: true, contentType: key});
                else if (key == "multipart/form-data")
                    functions.push({name: baseFunctionName + "WithMultipartForm", form: true, contentType: key});
                else if (key == "application/x-www-form-urlencoded")
                    functions.push({name: baseFunctionName + "WithForm", form: true, contentType: key});
                else {
                    functions.push({
                        name: baseFunctionName + "With" + OAS3Utils.sanitizeContentType(key) + "Buffer",
                        buffer: true,
                        contentType: key
                    });
                    functions.push({
                        name: baseFunctionName + "With" + OAS3Utils.sanitizeContentType(key) + "Stream",
                        stream: true,
                        contentType: key
                    });
                }
            });
        }

        let securityRequirements = operations[key].security;
        if (securityRequirements)
            operations[key].security = _.mapValues(_.keyBy(_.flatten(_.map(securityRequirements, (value) => _.keys(value)))), (value) => OAS3Utils.sanitizeSecuritySchemaName(value));

        operations[key].functions = functions;
        operations[key].parameters = OAS3Utils.extractParametersWithTypes(operations[key], project_info.language);
    });

    let securitySchemas = _.get(oas, 'components.securitySchemes');
    _.forOwn(securitySchemas, (value, key) => {
            securitySchemas[key].sanitized_schema_name = OAS3Utils.sanitizeSecuritySchemaName(key);
    });

    let info = {
        project_info: project_info,
        operations: operations,
        oas: oas
    };

    if (securitySchemas)
        info.security_schemas = securitySchemas;

    Utils.writeFilesSync([project_info.templates.client], [renderClient(info)], project_info.src_dir);

    return info;
}

module.exports = {
    hidden: true,
    generateWithoutPrompt: generateWithoutPrompt
};