let fs = require('fs-extra');
let path = require('path');
let deref = require('json-schema-ref-parser');
let _ = require('lodash');
let gutil = require('gulp-util');

let Utils = require('../../Utils.class');
let OAS3Utils = require('../../openapi/OAS3Utils.class');

function generateMetadata(project_info) {
    let oas = project_info.oas;

    // Prepare operations array
    operations = OAS3Utils.getPathsByOperationIds(oas);
    _.forOwn(operations, (operation, key) => {

        // Generate functions based on request bodies
        let baseFunctionName = OAS3Utils.sanitizeOperationId(key);
        operation.functions = [];
        if (!_.has(operation, "requestBody.content") || _.isEmpty(operation.requestBody.content)) {
            operation.functions.push({name: baseFunctionName, empty: true});
        } else {
            operation.functions.push({name: baseFunctionName + "WithEmptyBody", empty: true});
            _.forOwn(operation.requestBody.content, (value, contentType) => {
                if (contentType == "application/json")
                    operation.functions.push({name: baseFunctionName + "WithJson", json: true, contentType: contentType});
                else if (contentType == "multipart/form-data")
                    operation.functions.push({name: baseFunctionName + "WithMultipartForm", form: true, contentType: contentType});
                else if (contentType == "application/x-www-form-urlencoded")
                    operation.functions.push({name: baseFunctionName + "WithForm", form: true, contentType: contentType});
                else {
                    operation.functions.push({
                        name: baseFunctionName + "With" + OAS3Utils.sanitizeContentType(contentType) + "Buffer",
                        buffer: true,
                        contentType: contentType
                    });
                    operation.functions.push({
                        name: baseFunctionName + "With" + OAS3Utils.sanitizeContentType(contentType) + "Stream",
                        stream: true,
                        contentType: contentType
                    });
                }
            });
        }

        // Map security functions
        if (operation.security)
        // Generate an object with security schemas as keys and sanitized secuirity schema names as values
            operations[key].security = _.mapValues(
                _.keyBy(_.flatten(_.map(operation.security, (value) => _.keys(value)))),
                (value) => OAS3Utils.sanitizeSecuritySchemaName(value)
            );

        // Add parameters to operation
        operation.parameters = OAS3Utils.extractParametersWithTypes(operations[key], project_info.language);
    });

    // Prepare security schemas array
    let securitySchemas = _.get(oas, 'components.securitySchemes');
    _.forOwn(securitySchemas, (value, key) => {
        value.sanitized_schema_name = OAS3Utils.sanitizeSecuritySchemaName(key);
    });

    // Render client class
    let info = {
        project_info: project_info,
        operations: operations
    };
    if (securitySchemas)
        info.security_schemas = securitySchemas;

    return info;
}

function render (project_info) {
    let renderClient = Utils.loadSingleTemplate(project_info.templates.client, "client_openapi_class_generator", project_info.language);

    return {
        path: project_info.templates.client,
        content: renderClient(generateMetadata(project_info))
    };
}

module.exports = {
    hidden: true,
    render: render,
    metadata: generateMetadata
};