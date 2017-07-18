/**
 * Created by francesco on 14/07/17.
 */

var path = require('path');

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
    dependencies: {
        java_dependencies: [
            {
                group: "io.vertx",
                artifact: "vertx-core",
                version: constants.VERTX_VERSION
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
        ]
    },
    var_templates: {
        package: (language) => language.package.trim().replace(/^\.+(.+)/, "").replace(/(.+)\.+$/, ""), // function to trim package name and remove left and side undesired points
        java_src_dir: (language) => path.join(...(["src", "main", "java"].concat(language.package.split(".")))),
        kotlin_src_dir: (language) => path.join(...(["src", "main", "kotlin"].concat(language.package.split("."))))
    }
}