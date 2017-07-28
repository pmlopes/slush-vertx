/**
 * Created by francesco on 15/07/17.
 */

let _ = require('lodash');
let metadata = require('./openapi_metadata');
let Utils = require("../Utils.class");

let deref = require('json-schema-ref-parser');
let oasConverter = require('swagger2openapi');
let oasValidator = require('swagger2openapi/validate.js');

let sanitizeRegex = /([-\/.,_]+.)/g;
let magicReplace = (s) => s.replace(sanitizeRegex, v => v.slice(v.length-1, v.length).toUpperCase());

module.exports = class OAS3Utils {
    static resolveOpenAPISpec(openapispec, validate = false) {
        return deref.bundle(openapispec).then(result => {
            return new Promise((resolve, reject) => {
                oasConverter.convert(result, {resolve: false}, (err, result) => {
                    if (err)
                        reject(err);
                    else {
                        if (!validate || oasValidator.validateSync(result.openapi, {}))
                            resolve(result.openapi);
                        else
                            reject(new Error("OpenAPI 3 spec invalid"))
                    }
                })
            });
        }).then(result => Promise.all([deref.bundle(_.cloneDeep(result)), deref.dereference(result)]));
    }

    static getPathsByOperationIds(oas) {
        let result = {};
        for (var key in oas.paths) {
            for (var method in oas.paths[key]) {
                let operationId = oas.paths[key][method].operationId;
                oas.paths[key][method].parameters = _.unionBy(oas.paths[key][method].parameters, oas.paths[key].parameters, "name");
                result[operationId] = oas.paths[key][method];
                result[operationId]['method'] = method;
                result[operationId]['path'] = key;
                result[operationId]['operationId'] = operationId;
            }
        }
        return result;
    }

    static sanitizeSecuritySchemaName(securitySchemaName) {
        return magicReplace(securitySchemaName);
    }

    static sanitizeParameterName(oasName) {
        oasName = magicReplace(oasName.trim())

        return oasName.charAt(0).toLowerCase() + oasName.slice(1);
    }

    static sanitizeContentType(contentType) {
        contentType = contentType.trim();
        let i = contentType.indexOf("application/");
        if (i == 0) {
            contentType = magicReplace(contentType.slice(12 /* "application/".length */));
            return contentType.charAt(0).toUpperCase() + contentType.slice(1);
        } else {
            contentType = magicReplace(contentType);
            return contentType.charAt(0).toUpperCase() + contentType.slice(1);
        }
    }

    static sanitizeOperationId(operationId, stringToAppend) {
        return magicReplace(operationId) + ((stringToAppend) ? stringToAppend : "");
    }

    static getClassNameFromOperationId(operationId, stringToAppend) {
        let class_name = OAS3Utils.sanitizeOperationId(operationId, stringToAppend);
        class_name = class_name.charAt(0).toUpperCase() + class_name.slice(1);
        return class_name;
    }

    static walkMetadata(metadata, path) {
        if (_.isString(metadata))
            return metadata;
        else
            return OAS3Utils.walkMetadata(_.get(metadata, (path) ? path.slice(0, 1) : "default", metadata.default), path.slice(1));
    }

    static resolveType(language, oasType, oasFormat) {
        return OAS3Utils.walkMetadata(metadata.types_map, [language, oasType, oasFormat])
    }

    static resolveFunctionsNamesForParameterRendering(language, paramLocation, type, style, explode) {
        return OAS3Utils.walkMetadata(metadata.client_parameters_functions_map, [language, paramLocation, type, style, explode])
    }

    static extractParametersWithTypes(operation, language){
        let result = {
            header: [],
            query: [],
            path: [],
            cookie: []
        };

        if (operation.parameters)
            _.forEach(operation.parameters, (e) => {
                    result[e.in].push({
                        "name": OAS3Utils.sanitizeParameterName(e.name),
                        "languageType": OAS3Utils.resolveType(language, e.schema.type, e.schema.format),
                        "oasParameter": e,
                        "required": e.required,
                        "renderFunctionName": OAS3Utils.resolveFunctionsNamesForParameterRendering(language, e.in, e.schema.type, e.style, e.explode)
                    });
            });

        return result;
    }
};