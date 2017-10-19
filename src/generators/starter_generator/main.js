let fs = require('fs');
let path = require('path');
let Handlebars = require('handlebars');
let _ = require('lodash');

let Utils = require('../../Utils.class');
let constants = require('../../constants');
let metadata = require('../../common_metadata');

let languagesMetadata = {
    java: {
            build_tools: metadata.languages.java.build_tools,
            templates: {
                src: {
                    main: "MainVerticle.java"
                }
            },
            dependencies: metadata.languages.java.dependencies,
            questions: [
                metadata.questions.package
            ],
            var_templates: {
                package: metadata.var_templates.package,
                main: metadata.var_templates.main_class,
                src_dir: metadata.var_templates.src_dir
            }
        }, //TODO refactor metadata from here
    javascript: {
            build_tools: [
                metadata.build_tools.npm,
                metadata.build_tools.npm_with_jar
            ],
            dependencies: metadata.dependencies.javascript_dependencies,
            templates: {
                src: {
                    main: "main.js"
                }
            },
            src_dir: "src",
            main: "main.js"
        },
    groovy:
        {
            build_tools: [
                metadata.build_tools.gradle,
                metadata.build_tools.maven
            ],
            templates: {
                src: {
                    main: "MainVerticle.groovy"
                }
            },
            dependencies: metadata.dependencies.groovy_dependencies,
            questions: [
                metadata.questions.package
            ],
            var_templates: {
                package: metadata.var_templates.package,
                main: metadata.var_templates.main_class,
                src_dir: metadata.var_templates.src_dir
            }
        }, ruby: {
            build_tools: [
                metadata.build_tools.gradle,
                metadata.build_tools.maven
            ],
            templates: {
                src: {
                    main: "main.rb"
                }
            },
            dependencies: metadata.dependencies.ruby_dependecies,
            main: "main.rb",
            src_dir: path.join("src", "main", "ruby")
        },
    kotlin: {
            build_tools: [
                metadata.build_tools.maven
            ],
            templates: {
                src: {
                    main: "MainVerticle.kt"
                }
            },
            dependencies: metadata.dependencies.kotlin_dependencies,
            questions: [
                metadata.questions.package
            ],
            var_templates: {
                package: metadata.var_templates.package,
                main: metadata.var_templates.main_class,
                src_dir: metadata.var_templates.src_dir
            }
        }
};

module.exports = {
    name: "Vert.x Starter project",
    description: "Generate an empty project configured for Vert.x 3 Framework",
    metadata: {
        languages: languagesMetadata
    }
};
