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
            src: ["MainVerticle.java", path.join("users", "UsersRouter.java"), path.join("products", "ProductsRouter.java")],
            test: ["BaseTest.java", "ProductsTest.java", "UsersTest.java"]
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
        name: "javascript",
        build_tools: [
            metadata.build_tools.npm_with_jar
        ],
        templates: {
            src: ["main.js", path.join("users", "usersRouter.js"), path.join("products", "productsRouter.js")],
            test: ["productsTest.js", "usersTest.js"],
            config: ["config.json"]
        },
        dependencies: _.concat(
            metadata.dependencies.java_dependencies,
            metadata.dependencies.javascript_dependencies,
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
        main: "main.js",
        src_dir: "src",
        test_dir: "test",
        config_dir: ""
    },
    {
        name: "kotlin",
        build_tools: [
            metadata.build_tools.maven
        ],
        templates: {
            src: ["MainVerticle.kt", path.join("users", "UsersRouter.kt"), path.join("products", "ProductsRouter.kt")],
            test: ["BaseTest.kt", "ProductsTest.kt", "UsersTest.kt"]
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

let renderFunction = Utils.generateComplexRenderingFunction("vertx_web_starter_generator");
let generationFunction = Utils.generateGenerationFunction(languagesMetadata, renderFunction);

module.exports = {
    name: "Vert.x Web Server Starter",
    description: "Generate a skeleton with sources and tests for Vert.x 3 Web powered REST server",
    generate: generationFunction,
    render: renderFunction
};
