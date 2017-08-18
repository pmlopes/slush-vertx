{{#if package }}package {{ package }}.users;

{{else}}package users;

{{/if}}import io.vertx.core.Vertx;
import io.vertx.ext.web.RequestParameters;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.validation.HTTPRequestValidationHandler;
import io.vertx.ext.web.validation.ValidationException;

public class UsersRouter {

    Vertx vertx;

    public UsersRouter(Vertx vertx) {
        // Initialize router for users with parameters, db connectors, ...
        this.vertx = vertx;
    }

    public Router getRouter() {
        Router router = Router.router(vertx);

        router.get("/:user_id")
                .handler(HTTPRequestValidationHandler.create()
                        .addPathParamWithPattern("user_id", "[0-9]{4}[a-zA-Z]{6}"))
                .handler(routingContext -> {
                    RequestParameters params = routingContext.get("parsedParameters");
                    String user_id = params.pathParameter("user_id").getString();

                    // Now handle user_id

                })
                .failureHandler(routingContext -> {
                    if (routingContext.failure() instanceof ValidationException) {
                        routingContext.response().setStatusCode(400).end(routingContext.failure().getMessage());
                    } else {
                        // Handle your failure
                    }
                });


        return router;
    }

}
