let fs = require('fs-extra');
let path = require('path');
let deref = require('json-schema-ref-parser');
let _ = require('lodash');
let gutil = require('gulp-util');
let oasConverter = require('swagger2openapi');
let oasValidator = require('swagger2openapi/validate.js');

let Utils = require('../../Utils.class');
let OAS3Utils = require('../../openapi/OAS3Utils.class');

var generateWithoutPrompt = function (project_info, openapispec, done) {
    deref.bundle(openapispec).then(result => {
        return new Promise((resolve, reject) => {
            oasConverter.convert(result, {}, (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result.openapi)
            })
        });
    }).then(result => deref.dereference(result)).then(result => {
        let oas = result;

        // if (!oasValidator.validateSync(oas, {}))
        //     done(new gutil.PluginError('new', "OpenAPI 3 spec not valid!"));
        // Assume that is already validated

        let renderClient = Utils.loadSingleTemplate("client_openapi_class_generator", project_info.language, project_info.templates.client);

        operations = OAS3Utils.getPathsByOperationIds(oas);

        Object.keys(operations).forEach(key => {
            let baseFunctionName = OAS3Utils.sanitizeOperationId(key);

            let functions = [];

            if (_.isEmpty(operations[key].requestBody)) {
                functions.push({name: baseFunctionName, empty: true});
            } else {
                functions.push({name: baseFunctionName + "WithEmptyBody", empty: true});
                _.forOwn(operations[key].requestBody, (value, key) => {
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

            let securityRequirements = _.get(operations[key], 'security');
            if (securityRequirements)
                operations[key].security = _.mapValues(securityRequirements, (key) => OAS3Utils.sanitizeSecuritySchemaName(key));

            operations[key].functions = functions;
            operations[key].parameters = OAS3Utils.extractParametersWithTypes(operations[key], project_info.language);
        });

        let securitySchemas = _.get(oas, 'components.securitySchemes');
        if (securitySchemas) {
            Object.keys(securitySchemas).forEach(key => {
                securitySchemas[key].sanitized_schema_name = OAS3Utils.sanitizeSecuritySchemaName(key);
            });
        }

        let info = {
            project_info: project_info,
            operations: operations,
            oas: oas
        };

        if (securitySchemas)
            info.security_schemas = securitySchemas;

        Utils.writeFilesSync([project_info.templates.client], [renderClient(info)], project_info.src_dir);

        done();
    }).catch(error => done(new gutil.PluginError('new', error.stack)));
}

module.exports = {
    hidden: true,
    generateWithoutPrompt: generateWithoutPrompt
};