let Router = require('vertx-web-js/router');

module.exports = class ProductsRouter {
    constructor(vertx) {
        this.vertx = vertx;
    }

    getRouter() {
        let router = Router.router(vertx);

        router.post("/addNewProduct")
            .handler(routingContext => {
                let object = routingContext.getBodyAsJson();
                // Handle the new product
            })
            .failureHandler(routingContext => {
                // Handle your failure
            });

        return router;
    }
};