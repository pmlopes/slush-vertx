const GenerationEngine = require('./GenerationEngine');

class CLIGenerationEngine extends GenerationEngine {

    constructor(generator) {
        super(generator);
    }

}

module.exports = CLIGenerationEngine;