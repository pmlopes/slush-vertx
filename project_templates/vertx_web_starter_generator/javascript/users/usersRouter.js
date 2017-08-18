let HTTPRequestValidationHandler = require("vertx-web-js/http_request_validation_handler");
let Router = require('vertx-web-js/router');

module.exports = class ProductsRouter {
    constructor(vertx) {
        this.vertx = vertx;
    }

    getRouter() {
        let router = Router.router(vertx);

        router.get("/:user_id")
            .handler(HTTPRequestValidationHandler.create()
                .addPathParamWithPattern("user_id", "/[0-9]{4}[a-zA-Z]{6}/g")
                .handle)
            .handler(routingContext => {
                let params = routingContext.get("parsedParameters");
                let user_id = params.pathParameter("user_id").getString();
                // Now handle user_id
                routingContext.response().setStatusCode(200).end();
            })
            .failureHandler(routingContext => {
                if (routingContext.failure().getClass().getSimpleName() == 'ValidationException') {
                    routingContext.response().setStatusCode(400).end(routingContext.failure().getMessage());
                } else {
                    // Handle your failure
                    routingContext.response().setStatusCode(500).end(routingContext.failure().getMessage());
                }
            });


        return router;
    }
};