let _ = require('lodash');
let generatorsManager = require('./GeneratorsManager');
const constants = require('./constants');

const excludedVariablesDuringMerge = ["var_templates", "display_name", "description", "questions"];

class GenerationEngine {
    constructor(project_name, generator_id, language_id, build_tool_id, answers) {
        this.generator = generatorsManager.resolveGenerator(generator_id);

        this.dependencies = (this.generator.dependencies) ? this.generator.dependencies.map(dep_id => new GenerationEngine(project_name, dep_id, language_id, build_tool_id, _.cloneDeep(answers))) : [];

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

    render() {
        if (!_.isObject(this.project_info))
            this.buildProjectInfo();
        // TODO from here render
        if (this.generator.render) // Generator has its own generation function
            this.renderResults = this.generator.render(this.project_info);
        else {
            this.renderResults = [];
            _.forOwn(project_info.templates, (value, key) => {
                let templatesFunctions = Utils.loadGeneratorTemplates(value, generator_name, project_info.language); // TODO crea funzione di caricamento asincrono dei templates
                result = _.concat(result, _.zipWith(
                    value.map(p => path.join(project_info[key + "_dir"], p)),
                    templatesFunctions.map(template => template(project_info)),
                    (path, content) => new Object({path: path, content: content})
                ));
            });

            let buildFilesTemplatesFunctions = Utils.loadBuildFilesTemplates(project_info.build_tool.templates, project_info.build_tool.name);

            return _.concat(
                result,
                _.zipWith(
                    project_info.build_tool.templates,
                    buildFilesTemplatesFunctions.map(template => template(project_info)),
                    (path, content) => new Object({path: path, content: content})
                )
            )
        }

    }

    writeResults() {

    }

    run() {
        this.buildProjectInfo();
        this.render();
        return this.writeResults();
    }

}

module.exports = GenerationEngine;