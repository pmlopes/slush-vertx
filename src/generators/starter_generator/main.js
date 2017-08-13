let fs = require('fs');
let path = require('path');
let Handlebars = require('handlebars');
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
        templates: [
            "MainVerticle.java"
        ],
        dependencies: metadata.dependencies.java_dependencies,
        questions: [
            metadata.questions.package
        ],
        var_templates: {
            package: metadata.var_templates.package,
            main: metadata.var_templates.main_class,
            src_dir: metadata.var_templates.src_dir
        }
    },
    {
        name: "javascript",
        build_tools: [
            metadata.build_tools.npm,
            metadata.build_tools.npm_with_jar
        ],
        dependencies: metadata.dependencies.javascript_dependencies,
        templates: [
            "main.js"
        ],
        src_dir: "src",
        main: "main.js"
    },
    {
        name: "groovy",
        build_tools: [
            metadata.build_tools.gradle,
            metadata.build_tools.maven
        ],
        templates: [
            "MainVerticle.groovy"
        ],
        dependencies: metadata.dependencies.groovy_dependencies,
        questions: [
            metadata.questions.package
        ],
        var_templates: {
            package: metadata.var_templates.package,
            main: metadata.var_templates.main_class,
            src_dir: metadata.var_templates.src_dir
        }
    },
    {
        name: "ruby",
        build_tools: [
            metadata.build_tools.gradle,
            metadata.build_tools.maven
        ],
        templates: [
            "main.rb"
        ],
        dependencies: metadata.dependencies.ruby_dependecies,
        main: "main.rb",
        src_dir: path.join("src", "main", "ruby")
    },
    {
        name: "kotlin",
        build_tools: [
            metadata.build_tools.maven
        ],
        templates: [
            "MainVerticle.kt"
        ],
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
];

let renderFunction = Utils.generateRenderingFunction("starter_generator");
let generationFunction = Utils.generateGenerationFunction(languagesMetadata, renderFunction);

module.exports = {
    name: "Vert.x Starter project",
    generate: generationFunction,
    render: renderFunction
};
