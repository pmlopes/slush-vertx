/**
 * Created by francesco on 13/07/17.
 */

var fs = require('fs-extra');
var path = require('path');
var format = require("string-template");
let _ = require('lodash');

var Handlebars = require('handlebars');
var helpers = require('handlebars-helpers')();
Handlebars.registerHelper('escape', function(variable) {
    return variable.replace(/(['"])/g, '\\$1');
});

Handlebars.registerHelper('raw-helper', function(options) {
    return options.fn();
});

const HANDLEBARS_CONFIG = {noEscape: true};

const compileTemplate = (t) => Handlebars.compile(t, HANDLEBARS_CONFIG);

var gutil = require('gulp-util');
var inquirer = require('inquirer');

module.exports = class Utils {
    static mergeUnique(destination, source, comparator = ((x, y) => x == y), clonator = ((q) => _.cloneDeep(q))) {
        for (let x of source) {
            if (_.isUndefined(destination.find((y) => comparator(x, y))))
                destination.push(clonator(x));
        }
        return destination
    }

    /**
     * This function merges obj2 into obj1. Attention: It mutates obj1
     * @param obj1
     * @param obj2
     * @param overwrite
     * @return obj1
     */
    static mergeObjs(obj1, obj2, overwrite) {
        if (!_.isEmpty(obj2))
            Object.keys(obj2).forEach((key) => { if (overwrite || obj1[key] == undefined) obj1[key] = obj2[key] } );
        return obj1
    }

    static smartMergeObjects(destination, source, exclude) {
        if (!_.isEmpty(source)) {
            Object.keys(source).forEach((key) => {
                if (!exclude.includes(key)) {
                    if (!_.has(destination, key))
                        destination[key] = source[key];
                    else {
                        if (_.isArray(destination[key]) && _.isArray(source[key]))
                            destination[key].concat(...source[key]);
                        else if (_.isObject(destination[key]) && _.isObject(source[key]))
                            Utils.smartMergeObjects(destination[key], source[key]);
                        else
                            destination[key] = source[key];
                    }
                }
            });
        }
    }

    static processVariablesTemplates(obj, var_templates) {
        if (var_templates) {
            Object.keys(var_templates).forEach((key) => {
                if (var_templates[key] instanceof Function)
                    _.set(obj, key.split("."), var_templates[key](obj));
                else
                    _.set(obj, key.split("."), format(var_templates[key], obj));
            });
        }
        return obj;
    }

    static findKeyInObjectArray(list, id, key, secondaryKey) {
        if (!key) key = "name";
        if (!secondaryKey) secondaryKey = "display_name";
        return list.find(el => el[key] == id || (el[secondaryKey] && el[secondaryKey] == id));
    }

    static buildProjectObject(project_info, language, build_tool) {
        language.language = language.name;
        delete language.name;

        if (language.var_templates)
            delete language.var_templates;
        if (build_tool.var_templates)
            delete build_tool.var_templates;
        if (language.questions)
            delete language.questions;
        if (build_tool.questions)
            delete build_tool.questions;
        if (build_tool.dependencies)
            project_info.dependencies = _.concat(project_info.dependencies, build_tool.dependencies);
        if (build_tool.npm_dependencies)
            if (project_info.npm_dependencies)
                project_info.npm_dependencies = _.concat(project_info.npm_dependencies, build_tool.npm_dependencies);
            else
                project_info.npm_dependencies = build_tool.npm_dependencies;

        project_info = Utils.mergeObjs(project_info, language, true);
        project_info.build_tool = build_tool;

        return project_info;
    }

    static mkdirs(folderPath, mode) {
        var folders = [];
        var tmpPath = path.normalize(folderPath);
        var exists = fs.existsSync(tmpPath);
        while (!exists) {
            folders.push(tmpPath);
            tmpPath = path.join(tmpPath, '..');
            exists = fs.existsSync(tmpPath);
        }

        for (var i = folders.length - 1; i >= 0; i--) {
            fs.mkdirSync(folders[i], mode);
        }
    }

    static pickSelection(message, list) {
        return new Promise((resolve, reject) => {
            if (list.length > 1) {
                let optionsList = list.map(el => (el.display_name) ? {name: el.display_name, value: el} : {name: el.name, value: el});
                inquirer.prompt({ name: 'answer', message: message, type: 'list', choices: optionsList }).then(function (answer) {
                    resolve(answer.answer);
                });
            } else {
                resolve(list[0]);
            }
        });
    }

    static checkIfDirIsEmpty(dir) {
        return !['pom.xml', 'build.gradle', 'package.json', 'src', 'target'].some(function (el) {
            return fs.existsSync(dir + path.sep + el);
        });
    }

    static loadGeneratorTemplates(templates, generator_key, language_key = null) {
        let templatesDir = path.resolve((language_key) ?
            path.join(__project_templates, generator_key, language_key) :
            path.join(__project_templates, generator_key));

        const readFile = (t) => fs.readFile(path.join(templatesDir, t), 'utf-8');

        if (templates instanceof Array) {
            return Promise
                .all(templates.map(readFile)) // Read files
                .then((result) => Promise.resolve(result.map(compileTemplate))); // Compile templates
        } else if (templates instanceof Object) {
            return Promise
                .all(_.values(templates).map(t => {
                    if (t instanceof String) // If instance of string, load template
                        return readFile(t);
                    else if (t instanceof Array) // Nested array, call itself
                        return Utils.loadGeneratorTemplates(templates, generator_key, language_key);
                    else
                        Promise.reject("Wrong templates object");
                })) // Read files
                .then((result) => Promise.resolve(result.map(compileTemplate))) // Compile templates
                .then((result) => Promise.resolve(_.zipObject(_.keys(templates), result))); // Rebuild object
        } else
            return Promise.reject("Wrong templates object");
    }

    static loadSingleTemplate(template, generator_key, language_key = undefined) {
        let templatesDir;
        if (language_key)
            templatesDir = path.resolve(path.join(__project_templates, generator_key, language_key));
        else
            templatesDir = path.resolve(path.join(__project_templates, generator_key));
        let templateSource = fs.readFileSync(path.join(templatesDir, template), 'utf-8');
        return Handlebars.compile(templateSource, {noEscape: true});
    }

    static loadBuildFilesTemplates(templates, build_file_key) {
        const readFile = (t) => fs.readFile(path.resolve(path.join(__build_files_templates, build_file_key, t)), 'utf-8');
        return Promise
            .all(templates.map(readFile))
            .then((result) => Promise.resolve(result.map(compileTemplate)));
    }

    static writeFilesArraySync(files) {
        for (let i in files) {
            let finalPath = path.resolve(path.join(process.cwd(), files[i].path));
            fs.mkdirpSync(path.dirname(finalPath));
            gutil.log("Writing file ", gutil.colors.cyan(path.relative(process.cwd(), finalPath)));
            fs.writeFileSync(finalPath, files[i].content, 'utf-8');
        }
    }

    static processQuestions(questions, var_templates, project_info) {
        return new Promise((resolve, reject) => {
            if (questions)
                inquirer.prompt(questions).then(answers => {
                    resolve(Utils.processVariablesTemplates(answers, var_templates));
                });
        });
    }

    static processLanguage(allowedLanguages, project_info) {
        return new Promise((resolve, reject) => {
            Utils.pickSelection("Which language: ", allowedLanguages)
                .then((language) => {
                    Utils.pickSelection("Which build tool: ", language.build_tools).then((build_tool) => {
                        if (language.questions) {
                            inquirer.prompt(language.questions).then(answers => {
                                let result = {
                                    language: Utils.processVariablesTemplates(Utils.mergeObjs(language, answers, true), language.var_templates),
                                    build_tool: Utils.processVariablesTemplates(build_tool, build_tool.var_templates)
                                };

                                if (project_info)
                                    result.project_info = Utils.buildProjectObject(project_info, language, build_tool);

                                resolve(result);
                            });
                        } else {
                            let result = {
                                language: Utils.processVariablesTemplates(language, language.var_templates),
                                build_tool: Utils.processVariablesTemplates(build_tool, build_tool.var_templates)
                            };

                            if (project_info)
                                result.project_info = Utils.buildProjectObject(project_info, language, build_tool);

                            resolve(result);
                        }
                    })
                });
        });
    }

    static generateRenderingFunction(generator_name) {
        return function (project_info) {
            // Load templates
            let templatesFunctions = Utils.loadGeneratorTemplates(project_info.templates, generator_name, project_info.language);
            let buildFilesTemplatesFunctions = Utils.loadBuildFilesTemplates(project_info.build_tool.templates, project_info.build_tool.name);

            // Some lodash magic
            return _.concat(
                _.zipWith(
                    project_info.templates.map(p => path.join(project_info.src_dir, p)), // Prepend to paths the src_dir path
                    templatesFunctions.map(template => template(project_info)), // Render templates
                    (path, content) => new Object({path: path, content: content}) // Push into the array in a form {path: path, content: content}
                ),
                _.zipWith(
                    project_info.build_tool.templates,
                    buildFilesTemplatesFunctions.map(template => template(project_info)),
                    (path, content) => new Object({path: path, content: content})
                )
            )
        }
    }

    static generateGenerationFunction(languagesMetadata, renderFunction) {
        return function(project_info, done) {
            // Process questions about the language
            Utils.processLanguage(languagesMetadata, project_info).then((result) => {
                Utils.writeFilesArraySync(renderFunction(result.project_info));
                done();
            });
        }
    }
}