let _ = require('lodash');
let generatorsManager = require('./GeneratorsManager');
const constants = require('./constants');

const excludedVariablesDuringMerge = ["var_templates", "display_name", "description", "questions"];

class GenerationEngine {
    constructor(project_name, generator_id, language_id, build_tool_id, answers) {
        this.generator = generatorsManager.resolveGenerator(generator_id);

        this.dependencies = (this.generator.dependencies) ? this.generator.dependencies.map(dep_id => new GenerationEngine(project_name, dep_id, language_id, build_tool_id, _.cloneDeep(answers))) : [];

        this.name = this.generator.name;

        this.project_name = project_name;
        this.generator_id = generator_id;
        this.language_id = language_id;
        this.build_tool_id = build_tool_id;
        this.answers = answers;
    }

    buildProjectInfo() {
        // With Great Power Comes Great Responsibility
        this.project_info = {};
        this.project_info.project_name = this.project_name;

        // Merge language, build tools and answers meta into project_info
        Utils.smartMergeObjects(this.project_info, this.generator.metadata.languages[this.language_id], excludedVariablesDuringMerge);
        Utils.smartMergeObjects(this.project_info, this.generator.metadata.languages[this.language_id].build_tools[this.build_tool_id], excludedVariablesDuringMerge);
        Utils.smartMergeObjects(this.project_info, this.answers, []);

        // Process variable templates
        Utils.processVariablesTemplates(this.project_info, this.generator.metadata.languages[this.language_id].var_templates);
        Utils.processVariablesTemplates(this.project_info, this.generator.metadata.languages[this.language_id].build_tools[this.build_tool_id].var_templates);

        // Add output directories
        if (this.project_info.output_directories)
            Utils.mergeObjs(this.project_info.output_directories, constants.DEFAULT_OUTPUT_DIRS, false);
        else
            this.project_info.output_directories = _.cloneDeep(constants.DEFAULT_OUTPUT_DIRS);

        // Run dependencies build project info
        this.dependencies.forEach((dep) => dep.buildProjectInfo());
    }

    writeResults() {}

    /**
     * The rendering returns an array with objects containing path of file, content of file and id of file/group of files (depending of template format)
     */
    runRendering() {
        this.buildProjectInfo();
        if (this.dependencies) {
            return Promise
                .all(this.dependencies.map((el) => el.render()))
                .then((results) =>
                    Promise.resolve(_.zipWith(this.dependencies, results, (depGen, result) => new Object({name: depGen.name, result: result})))
                );
        }
        else
            return this.render([]);
    }

    /**
     *
     * @param dependenciesResult array of objects with name as dependency name and result as array of render results
     * @return {*}
     */
    render(dependenciesResult) {
        if (this.generator.render) // Generator has its own generation function
            return this.generator.render(this.project_info, dependenciesResult);
        else
            return this.defaultRenderingFunction(dependenciesResult);
    }

    defaultRenderingFunction(dependencies) { // This default rendering function handles every type of templates format
        Utils.loadGeneratorTemplates(value, this.name, this.language_id)
            .then((templates) => Promise.all(
                templates,
                Utils.loadBuildFilesTemplates(this.project_info.build_tool.templates, this.build_tool_id)))
            .then((templatesFunctions) => {
                let renderedFiles = [];
                if (templatesFunctions[0] instanceof Array)
                    renderedFiles = _.zipWith(
                        this.project_info.templates.map(p => path.join(this.project_info.output_directories.src, p)), // Prepend to paths the src path
                        templatesFunctions[0].map(template => template(project_info)), // Render templates
                        (path, content) => new Object({path: path, content: content}) // Push into the array in a form {path: path, content: content}
                    );
                else if (templatesFunctions[0] instanceof Object) {
                    /*
                    templatesFunctions[0] can be in two forms:

                    {
                        t_id_1: "path/to/Class.java",
                        ...
                    }

                    or

                    {
                        t_group_id_1: ["path/to/Class1.java", "path/to/Class2.java"],
                        ...
                    }

                    or both together

                     */
                    renderedFiles = _.flatten(_.zipWith( // Need to flatten for last nested arrays
                        _.keys(this.project_info.templates),
                        _.values(this.project_info.templates),
                        templatesFunctions[0],
                        (t_id, t_path, t_functions) => {
                            if (t_path instanceof String) {
                                return new Object({
                                    path: path.join((this.project_info.output_directories[t_id]) ? this.project_info.output_directories : this.project_info.output_directories.src, t_path),
                                    id: t_id,
                                    content: t_functions(this.project_info)
                                });
                            } else if (t_path instanceof Array) {
                                return _.zipWith(
                                    t_path.map(p => path.join((this.project_info.output_directories[t_id]) ? this.project_info.output_directories[t_id] : this.project_info.output_directories.src, p)),
                                    t_functions.map(t => t(this.project_info)),
                                    (path, content) => new Object({path: path, id: t_id, content: content})
                                )
                            }
                        }
                    ));
                }
                return Promise.resolve(_.concat(
                    renderedFiles,
                    this.dependencies.map(d => d.result),
                    _.zipWith(
                        this.project_info.build_tool.templates,
                        templatesFunctions[1].map(template => template(this.project_info)),
                        (path, content) => new Object({path: path, content: content})
                    )))
            });
    }

}

module.exports = GenerationEngine;