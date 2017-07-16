/**
 * Created by francesco on 15/07/17.
 */

module.exports = class OAS3Utils {
    static getPathsByOperationIds(oas) {
        let result = {};
        for (var key in oas.paths) {
            for (var method in oas.paths[key]) {
                let operationId = oas.paths[key][method].operationId;
                result[operationId] = oas.paths[key][method];
                result[operationId]['method'] = method;
            }
        }
        return result;
    }

    static getClassNameFromOperationId(operationId, stringToAppend) {
        let class_name = (operationId.replace(/([-.,_]+.)/,
                (v) => v.slice(v.length-1, v.length).toUpperCase())) + ((stringToAppend) ? stringToAppend : "");
        class_name = class_name.charAt(0).toUpperCase() + class_name.slice(1);
        return class_name;
    }
};