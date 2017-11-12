let Joi = require('joi');

const generatorNamePattern = /[a-zA-Z][a-zA-Z0-9_]*/g;
const stringSchema = Joi.string().min(1);
const patternSchema = Joi.alternatives().try(stringSchema, Joi.object().type(RegExp));

const questionsSchema = Joi.alternatives().try(
    /* Input schema */ Joi.object().keys({
        type: Joi.any().valid("input"),
        name: stringSchema,
        message: stringSchema,
        pattern: patternSchema
    }).requiredKeys("type", "name", "message"),
    /* Confirm schema */ Joi.object().keys({
        type: Joi.any().valid("confirm"),
        name: stringSchema,
        message: stringSchema
    }).requiredKeys("type", "name", "message"),
    /* List schema */ Joi.object().keys({
        type: Joi.any().valid("list"),
        name: stringSchema,
        message: stringSchema,
        choices: Joi.array().items(Joi.object().keys({
            name: stringSchema,
            value: stringSchema
        }).requiredKeys("name", "value"))
    }).requiredKeys("type", "name", "message", "choices"),
    /* Checkbox schema */ Joi.object().keys({
        type: Joi.any().valid("checkbox"),
        name: stringSchema,
        message: stringSchema,
        choices: Joi.array().items(Joi.object().keys({
            name: stringSchema,
            value: stringSchema
        }).requiredKeys("name", "value"))
    }).requiredKeys("type", "name", "message"),
    /* File schema */ Joi.object().keys({
        type: Joi.any().valid("file"),
        name: stringSchema,
        message: stringSchema,
        loader: Joi.func().arity(1)
    }).requiredKeys("type", "name", "message")
);

const mavenDependenciesSchema = Joi.object().keys({
    group: stringSchema,
    artifact: stringSchema,
    version: stringSchema,
    test: Joi.boolean()
}).requiredKeys("group", "artifact", "version");

const languagesMetadataSchema = Joi.array().items(Joi.object().keys({
    name: stringSchema,
    build_tools: Joi.array().min(1).items(Joi.object().keys({
        name: stringSchema,
        diplay_name: stringSchema,
        templates: Joi.array().items(stringSchema),
        dependencies: Joi.array().items(mavenDependenciesSchema)
    }).required("name", "templates").unknown(true)),
    templates: Joi.alternatives().try(
        /* Array of templates */ Joi.array().min(1).items(stringSchema),
        /* Named groups of templates */ Joi.object().pattern(/[a-zA-Z]*/g, Joi.array().min(1).items(stringSchema)),
        /* Object of templates */ Joi.object().pattern(generatorNamePattern, stringSchema)
    ),
    dependencies: Joi.array().items(mavenDependenciesSchema),
    questions: Joi.array().items(questionsSchema),
    output_directories: Joi.object.keys({
        src: stringSchema.default(""),
        test: stringSchema.default("test"),
        build_tool: stringSchema.default("")
    }),
    var_templates: Joi.array().items(Joi.alternatives().try(
        stringSchema,
        Joi.func().arity(1)
    ))
}).requiredKeys("name", "build_tools", "templates", "dependencies").unknown(true));

module.exports = Joi.object().keys({
    name: Joi.string().regex(generatorNamePattern),
    metadata: languagesMetadataSchema,
    description: stringSchema,
    afterProjectInfoBuild: Joi.func().arity(1),
    render: Joi.func().minArity(1), // Render function has a first parameter the project_info, as a second parameter (optional) the dependencies result
    afterRender: Joi.func().minArity(1), // Same as above
    dependencies: Joi.object().pattern(generatorNamePattern, Joi.object().keys({
        afterProjectInfoBuild: Joi.func().arity(1),
        afterRender: Joi.func().minArity(1)
    }))
}).requiredKeys("name", "metadata");