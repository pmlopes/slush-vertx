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
    var_templates: {
        java_src_dir: (language) => path.join(...(["src", "main", "java"].concat(language.package.split(".")))),
        kotlin_src_dir: (language) => path.join(...(["src", "main", "kotlin"].concat(language.package.split("."))))
    }
}