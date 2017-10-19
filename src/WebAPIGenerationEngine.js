const GenerationEngine = require('./GenerationEngine');

class WebAPIGenerationEngine extends GenerationEngine {

    constructor(generator) {
        super(generator);
    }

}

module.exports = WebAPIGenerationEngine;