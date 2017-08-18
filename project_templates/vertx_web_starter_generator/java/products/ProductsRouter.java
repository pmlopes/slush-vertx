{{#if package }}package {{ package }}.products;

{{else}}package products;

{{/if}}import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;

public class ProductsRouter {

    Vertx vertx;

    public ProductsRouter(Vertx vertx) {
        // Initialize router for products with parameters, db connectors, ...
        this.vertx = vertx;
    }

    public Router getRouter() {
        Router router = Router.router(vertx);

        router.post("/addNewProduct")
                .handler(routingContext -> {
                    JsonObject object = routingContext.getBodyAsJson();
                    // Handle the new product
                })
                .failureHandler(routingContext -> {
                    // Handle your failure
                });


        return router;
    }

}
