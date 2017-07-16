/**
 * Created by francesco on 13/07/17.
 */

var fs = require('fs-extra');
var path = require('path');
var format = require("string-template");

var Handlebars = require('handlebars');
var helpers = require('handlebars-helpers')(['comparison']);

var inquirer = require('inquirer');

module.exports = class Utils {
    static findKeyInObjectArray(list, id, key) {
        if (!key) key = "name";
        return list.find(el => el[key] == id);
    }

    static mergeObjs(obj1, obj2, overwrite) {
        Object.keys(obj2).forEach((key) => { if (overwrite || obj1[key] == undefined) obj1[key] = obj2[key] } )
        return obj1
    }

    static buildProjectObject(project_info, language, build_tool) {
        language.language = language.name;
        delete language.name;

        if (language.var_templates)
            delete language.var_templates;
        if (build_tool.var_templates)
            delete build_tool.var_templates;

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
                inquirer.prompt({ name: 'answer', message: message, type: 'list', choices: list }).then(function (answer) {
                    resolve(Utils.findKeyInObjectArray(list, answer.answer));
                });
            } else {
                resolve(list[0]);
            }
        });
    }

    static checkIfDirIsEmpty(dir) {
        return !['pom.xml', 'build.gradle', 'package.json'].some(function (el) {
            return fs.existsSync(dir + path.sep + el);
        });
    }

    static loadLanguageTemplates(generator_key, language_key, templates) {
        let result;
        let languageDir = path.resolve(path.join(__dirname, "project_templates", generator_key, language_key));
        if (templates instanceof Array) {
            result = [];
            templates = templates.map((template) => path.join(languageDir, template));
            templates.forEach((templatePath) => {
                let templateSource = fs.readFileSync(templatePath, 'utf-8');
                result.push(Handlebars.compile(templateSource));
            });
        } else {
            result = {};
            Object.keys(templates).map((key) => {
                let templateSource = fs.readFileSync(path.join(languageDir, templates[key]), 'utf-8');
                result[key] = Handlebars.compile(templateSource);
            });

        }
        return result;
    }

    static loadBuildFilesTemplates(build_file_key, templates) {
        let result = [];
        let buildFilesDir = path.resolve(path.join(__dirname, "build_files_templates", build_file_key));
        templates = templates.map((template) => path.join(buildFilesDir, template));
        templates.forEach((templatePath) => {
            let templateSource = fs.readFileSync(templatePath, 'utf-8');
            result.push(Handlebars.compile(templateSource));
        });
        return result;
    }

    static writeFilesSync(file_relative_paths, file_contents, path_to_prepend) {
        for (let i = 0; i < file_relative_paths.length; i++) {
            if (path_to_prepend)
                var finalPath = path.join(process.cwd(), path_to_prepend, file_relative_paths[i]);
            else
                var finalPath = path.join(process.cwd(), file_relative_paths[i]);
            fs.mkdirpSync(path.dirname(finalPath));
            fs.writeFileSync(finalPath, file_contents[i],'utf-8')
        }
    }

    static processVariablesTemplates(obj, var_templates) {
        if (var_templates) {
            Object.keys(var_templates).forEach((key) => {
                if (var_templates[key] instanceof Function)
                    obj[key] = var_templates[key](obj);
                else
                    obj[key] = format(var_templates[key], obj)
            });
        }
        return obj;
    }

    static processQuestions(questions, var_templates) {
        return new Promise((resolve, reject) => {
            if (questions)
                inquirer.prompt(questions).then(answers => {
                    resolve(Utils.processVariablesTemplates(answers, var_templates));
                });
        });
    }

    static processLanguage(allowedLanguages) {
        return new Promise((resolve, reject) => {
            Utils.pickSelection("Which language: ", allowedLanguages)
                .then((language) => {
                    Utils.pickSelection("Which build tool: ", language.build_tools).then((build_tool) => {
                        if (language.questions) {
                            inquirer.prompt(language.questions).then(answers => {
                                resolve({
                                        language: Utils.processVariablesTemplates(Utils.mergeObjs(language, answers, true), language.var_templates),
                                        build_tool: Utils.processVariablesTemplates(build_tool, build_tool.var_templates)
                                });
                            });
                        } else
                            resolve({
                                language: Utils.processVariablesTemplates(language, language.var_templates),
                                build_tool: Utils.processVariablesTemplates(build_tool, build_tool.var_templates)
                            });
                    })
                });
        });
    }
}