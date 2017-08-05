/**
 * Created by francesco on 14/07/17.
 */

var path = require('path');
var constants = require('./constants');

module.exports = {
    build_tools: {
        maven: {
            name: "maven",
            templates: ["pom.xml"]
        },
        gradle: {
            name: "gradle",
            templates: ["build.gradle"]
        },
        npm: {
            name: "npm",
            templates: ["package.json", "webpack.config.js"]
        }
    },
    questions: {
        package: {
            type: "input",
            name: "package",
            message: "Which package name you want? "
        }
    },
    resources_dir: path.join("src", "main","resources"),
    dependencies: {
        java_dependencies: [
            {
                group: "io.vertx",
                artifact: "vertx-core",
                version: constants.VERTX_VERSION
            }
        ],
        java_test_dependencies: [
            {
                group: "junit",
                artifact: "junit",
                version: "4.12",
                test: true
            }
        ],
        kotlin_dependencies: [
            {
                group: "io.vertx",
                artifact: "vertx-core",
                version: constants.VERTX_VERSION
            },
            {
                group: "io.vertx",
                artifact: "vertx-lang-kotlin",
                version: constants.VERTX_VERSION
            },
            {
                group: "org.jetbrains.kotlin",
                artifact: "kotlin-stdlib-jre8",
                version: "${kotlin.version}"
            }
        ],
        kotlin_test_dependencies: [
            {
                group: "org.jetbrains.kotlin",
                artifact: "kotlin-test-junit",
                version: "${kotlin.version}",
                test: true
            }
        ],
        groovy_dependencies: [
            {
                group: "io.vertx",
                artifact: "vertx-core",
                version: constants.VERTX_VERSION
            },
            {
                group: "io.vertx",
                artifact: "vertx-lang-groovy",
                version: constants.VERTX_VERSION
            },
            {
                group: "org.codehaus.groovy",
                artifact: "groovy-all",
                version: "2.4.7"
            }
        ],
        ruby_dependecies: [
            {
                group: "io.vertx",
                artifact: "vertx-core",
                version: constants.VERTX_VERSION
            },
            {
                group: "io.vertx",
                artifact: "vertx-lang-ruby",
                version: constants.VERTX_VERSION
            }
        ],
        vertx_test_dependencies: [
            {
                group: "io.vertx",
                artifact: "vertx-unit",
                version: constants.VERTX_VERSION,
                test: true
            }
        ]
    },
    var_templates: {
        main_class: (language) => (language.package) ? language.package + ".MainVerticle" : "MainVerticle",
        package: (language) => language.package.trim().replace(/^\.+(.+)/, "").replace(/(.+)\.+$/, ""), // function to trim package name and remove left and side undesired points
        src_dir: (language) => path.join(...(["src", "main", language.name].concat(language.package.split(".")))),
        test_dir: (language) => path.join(...(["src", "test", language.name].concat(language.package.split("."))))
    }
}