let fs = require('fs-extra');
let path = require('path');
let _ = require('lodash');
let gutil = require('gulp-util');

let Utils = require('../../Utils.class');
let OAS3Utils = require('../../openapi/OAS3Utils.class');
let constants = require('../../constants');
let metadata = require('../../common_metadata');

let docTemplates = ["README.md", "Operations.md"];

let clientMetadata = require(path.join(__src, "generators", "client_openapi_class_generator", "main.js")).metadata;

let languagesMetadata = [
    {
        name: "java",
        build_tools: [
            metadata.build_tools.gradle,
            metadata.build_tools.maven
        ],
        templates:
        {
            client: "ApiClient.java"
        },
        resources_dir: metadata.resources_dir,
        dependencies: _.concat(metadata.dependencies.java_dependencies, [
            {
                group: "io.vertx",
                artifact: "vertx-web-client",
                version: constants.VERTX_VERSION
            }
        ]),
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
        name: "kotlin",
        build_tools: [
            metadata.build_tools.maven
        ],
        templates:
        {
            client: "ApiClient.kt"
        },
        resources_dir: metadata.resources_dir,
        dependencies: _.concat(metadata.dependencies.kotlin_dependencies, [
            {
                group: "io.vertx",
                artifact: "vertx-web-client",
                version: constants.VERTX_VERSION
            }
        ]),
        questions: [
            metadata.questions.package
        ],
        var_templates: {
            package: metadata.var_templates.package,
            main: metadata.var_templates.main_class,
            src_dir: metadata.var_templates.src_dir
        }
    },
    // {
    //     name: "groovy",
    //     build_tools: [
    //         metadata.build_tools.gradle,
    //         metadata.build_tools.maven
    //     ],
    //     templates:
    //         {
    //             main: "MainVerticle.groovy",
    //             handler: "Handler.groovy",
    //             security_handler: "SecurityHandler.groovy"
    //         },
    //     resources_dir: "src/resources",
    //     dependencies: _.concat(metadata.dependencies.groovy_dependencies, [
    //         {
    //             group: "io.vertx",
    //             artifact: "vertx-web",
    //             version: constants.VERTX_VERSION
    //         },
    //         {
    //             group: "io.vertx",
    //             artifact: "vertx-web-api-contract",
    //             version: constants.VERTX_VERSION
    //         }
    //     ]),
    //     questions: [
    //         metadata.questions.package
    //     ],
    //     var_templates: {
    //         package: metadata.var_templates.package,
    //         main: metadata.var_templates.main_class,
    //         src_dir: metadata.var_templates.src_dir
    //     }
    // },
];

function render(project_info) {
    let info = clientMetadata(project_info);

    let renderClient = Utils.loadSingleTemplate(project_info.templates.client, "client_openapi_class_generator", project_info.language);
    let docTemplatesFunctions = Utils.loadGeneratorTemplates(docTemplates, "client_openapi_generator");
    let buildFilesTemplatesFunctions = Utils.loadBuildFilesTemplates(project_info.build_tool.templates, project_info.build_tool.name);

    // Some lodash magic
    return _.concat(
        _.zipWith(
            docTemplates,
            docTemplatesFunctions.map(template => template(info)), // Render templates
            (path, content) => new Object({path: path, content: content}) // Push into the array in a form {path: path, content: content}
        ),
        _.zipWith(
            project_info.build_tool.templates,
            buildFilesTemplatesFunctions.map(template => template(project_info)),
            (path, content) => new Object({path: path, content: content})
        ),
        {
            path: path.join(project_info.src_dir,project_info.templates.client),
            content: renderClient(info)
        },
        {
            path: path.join(project_info.resources_dir, project_info.spec_filename),
            content: JSON.stringify(project_info.oasSerializable)
        }
    )
}

module.exports = {
    name: "Client OpenAPI project",
    generate: function (project_info, done) {
        Utils.processLanguage(languagesMetadata, project_info).then(result => {
            return Promise.all([result, Utils.processQuestions({
                type: 'input',
                name: 'openapispec',
                message: "Choose the OpenAPI Specification (2.0 spec will be automatically converted to 3.0 spec): "
            })])
        }).then(results => {
            return Promise.all([...results, OAS3Utils.resolveOpenAPISpec(results[1].openapispec, true)]);
        }).then(results => {
            let project_info = results[0].project_info;
            project_info.oas = results[2][1];
            project_info.oasSerializable = results[2][0];
            project_info.spec_path = results[1].openapispec;
            project_info.spec_filename = path.basename(project_info.spec_path, path.extname(project_info.spec_path)) + ".json";

            Utils.writeFilesArraySync(render(project_info));

            done();
        }).catch(error => done(new gutil.PluginError('new', error.stack)));
    },
    render: render
};
