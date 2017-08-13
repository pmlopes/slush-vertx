let path = require('path');
let _ = require('lodash');

let Utils = require('../../Utils.class');
let constants = require('../../constants');
let metadata = require('../../common_metadata');

let languagesMetadata = [
    {
        name: "java",
        build_tools: [
            metadata.build_tools.gradle,
            metadata.build_tools.maven
        ],
        templates: {
            main: "MainVerticle.java",
            users: path.join("users", "UsersRouter.java"),
            products: path.join("products", "ProductsRouter.java"),
            base_test: "BaseTest.java",
            products_test: "ProductsTest.java",
            users_test: "UsersTest.java"
        },
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
        templates: {
            main: "MainVerticle.kt",
            users: path.join("users", "UsersRouter.kt"),
            products: path.join("products", "ProductsRouter.kt"),
            base_test: "BaseTest.kt",
            products_test: "ProductsTest.kt",
            users_test: "UsersTest.kt"
        },
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
    }
];

let renderFunction = Utils.generateRenderingFunctionWithTests("vertx_web_starter_generator");
let generationFunction = Utils.generateGenerationFunction(languagesMetadata, renderFunction);

module.exports = {
    name: "Vert.x Web Server Starter",
    generate: generationFunction,
    render: renderFunction
};
