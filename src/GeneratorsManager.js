let path = require('path');
let fs = require('fs');
let _ = require('lodash');
let Utils = require('./Utils');
let GeneratorSchema = require('./GeneratorSchema');

let Joi = require('joi');

const questionsComparator = (x, y) => x.name === y.name;
const questionsClonator = (q) => _.cloneDeep(_.omit(q, ["pattern", "loader"]))

const runtimeQuestionsPath = (language_id, build_tool_id) => ["metadata", "languages", language_id, "build_tools", build_tool_id, "__questions"];

class GeneratorsManager {
    constructor() {
        this.__generators = [];
        fs.readdirSync(path.join(__src, "generators")).forEach((el) => {
            try {
                let gen = require(path.join(__src, "generators", el, "main.js"));
                gen = generatorSchema.validate(obj);
                if (gen) {
                    gen.id = el;
                    this.__generators.push(gen);
                }
            } catch (e) {
                console.error(e);
                process.exit(0);
            }
        });
    }

    addGenerator(gen) {
        this.__generators.push(gen);
    }

    get generators() {
        this.__generators;
    }

    static validateGenerator(obj) {
        return GeneratorSchema.validate(obj);
    };

    resolveGenerator(generator_id) {
        return this.generators.find((gen) => gen.id == generator_id);
    }

    /**
     * Returns an array with objects describing languages and associated build tools. "description" and "display_name" fields are optional. For example:
     * [{
     *  id: "java",
     *  display_name: "Java 8",
     *  build_tools: [{
     *      id: "maven"
     *      description: "Apache Maven with OSS repositories"
     *  }],
     * }]
     *
     * @param generator_id
     */
    getLanguagesAndBuildToolsForGenerator(generator_id) {
        let generator = this.resolveGenerator(generator_id);
        if (generator) {
            if (generator.__runtime_languages_map)
                return generator.__runtime_languages_map;
            else {
                let languages = _.map(
                    generator.metadata.languages,
                    (language, language_id) => _.merge(
                        {
                            id: language_id,
                            build_tools: _.map(
                                language.build_tools,
                                (build_tool, build_tool_id) => _.merge({id: build_tool_id}, _.pick(build_tool, 'display_name', 'description'))
                            )
                        }, _.pick(language, 'display_name', 'description'))
                );
                generator.__runtime_languages_map = languages;
                return languages;
            }
        } else {
            throw new Error("Generator not found");
        }
    }

    /**
     * Return the array of questions required to build project_info object
     * @param generator_id
     * @param language_id
     * @param build_tool_id
     */
    getQuestionsForGeneratorLanguageBuildTool(generator_id, language_id, build_tool_id) {
        let questions = [];
        let generator = this.resolveGenerator(generator_id);
        if (generator) {
            // Check if is already created
            if (_.has(generator, runtimeQuestionsPath(language_id, build_tool_id)))
                return _.get(generator, runtimeQuestionsPath(language_id, build_tool_id));

            // Concat generator global questions
            if (_.isArray(generator.questions))
                Utils.mergeUnique(questions, generator.questions, questionsComparator, questionsClonator);

            // Concat language questions
            let language_questions = _.get(generator, ["metadata", "languages", language_id, "questions"]);
            if (_.isArray(language_questions))
                Utils.mergeUnique(questions, language_questions, questionsComparator, questionsClonator);

            // Concat build tool questions
            let build_tool_questions = _.get(generator, ["metadata", "languages", language_id, "build_tools", build_tool_id, "questions"]);
            if (_.isArray(build_tool_questions))
                Utils.mergeUnique(questions, build_tool_questions, questionsComparator, questionsClonator);

            if (generator.dependencies)
                Object.keys(generator.dependencies).forEach((dep_id) =>
                    Utils.mergeUnique(
                        questions,
                        GeneratorsManager.getQuestionsForGeneratorLanguageBuildTool(dep_id, language_id, build_tool_id),
                        questionsComparator,
                        questionsClonator
                    )
                );

            _.set(generator, runtimeQuestionsPath(language_id, build_tool_id), questions);

            return questions;

        } else {
            throw new Error("Generator not found");
        }
    }

    //TODO questions workflow
    /*
    input and file questions need an answer processing
     */

    getCliGenerationEngine(project_name, generator_id, language_id, build_tool_id, answers) {
        //TODO
    }

    getWebAPIGenerationEngine(project_name, generator_id, language_id, build_tool_id, answers) {
        //TODO
    }

    getNodeAPIGenerationEngine(project_name, generator_id, language_id, build_tool_id, answers) {
        //TODO
    }

}

module.exports = new GeneratorsManager();