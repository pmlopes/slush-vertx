/**
 * Created by francesco on 21/07/17.
 */

module.exports = {
    types_map: {
        java: { // First nested is type, second nested is format
            object: "Map<String, Object>",
            array: "List<Object>",
            string: "String",
            integer: {
                int32: "Integer",
                int64: "Long",
                default: "Integer"
            },
            number: {
                float: "Float",
                double: "Double",
                default: "Float"
            },
            boolean: "Boolean",
            default: "Object"
        },
        kotlin: {
            object: "MutableMap<String, Any>?",
            array: "MutableList<String>?",
            string: "String?",
            integer: {
                int32: "Int?",
                int64: "Long?",
                default: "Int?"
            },
            number: {
                float: "Float?",
                double: "Double?",
                default: "Float?"
            },
            boolean: "Boolean?",
            default: "Any?"
        }
    },
    client_parameters_functions_map: {
        default: {
            path: {
                array: {
                    matrix: {
                        true: "renderPathArrayMatrixExplode",
                        default: "renderPathArrayMatrix"
                    },
                    label: {
                        true: "renderPathArrayLabelExplode",
                        default: "renderPathArrayLabel"
                    },
                    simple: {
                        true: "renderPathArraySimpleExplode",
                        default: "renderPathArraySimple"
                    },
                    default: "renderPathArraySimple"
                },
                object: {
                    matrix: {
                        true: "renderPathObjectMatrixExplode",
                        default: "renderPathObjectMatrix"
                    },
                    label: {
                        true: "renderPathObjectLabelExplode",
                        default: "renderPathObjectLabel"
                    },
                    simple: {
                        true: "renderPathObjectSimpleExplode",
                        default: "renderPathObjectSimple"
                    },
                    default: "renderPathObjectSimple"
                },
                default: {
                    matrix: "renderPathMatrix",
                    label: "renderPathLabel",
                    default: "renderPathParam"
                }
            },
            query: {
                array: {
                    form: {
                        false: "addQueryArrayForm",
                        default: "addQueryArrayFormExplode"
                    },
                    spaceDelimited: "addQueryArraySpaceDelimited",
                    pipeDelimited: "addQueryArrayPipeDelimited",
                    default: "addQueryArrayFormExplode"
                },
                object: {
                    form: {
                        false: "addQueryObjectForm",
                        default: "addQueryObjectFormExplode"
                    },
                    spaceDelimited: "addQueryObjectSpaceDelimited",
                    pipeDelimited: "addQueryObjectPipeDelimited",
                    deepObject: "addQueryObjectDeepObjectExplode",
                    default: "addQueryObjectFormExplode"
                },
                default: "addQueryParam"
            },
            cookie: {
                array: {
                    default: {
                        true: "renderCookieArrayFormExplode",
                        default: "renderCookieArrayForm"
                    }
                },
                object: {
                    default: {
                        true: "renderCookieObjectFormExplode",
                        default: "renderCookieObjectForm"
                    }
                },
                default: "renderCookieParam"
            },
            header: {
                array: {
                    default: {
                        true: "addHeaderArraySimpleExplode",
                        default: "addHeaderArraySimple"
                    }
                },
                object: {
                    default: {
                        true: "addHeaderObjectSimpleExplode",
                        default: "addHeaderObjectSimple"
                    }
                },
                default: "addHeaderParam"
            },
        }
    }
};