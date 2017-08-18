{{#if package }}package {{ package }}.users

{{else}}package users

{{/if}}import io.vertx.core.Vertx
import io.vertx.ext.web.RequestParameters
import io.vertx.ext.web.Router
import io.vertx.ext.web.validation.HTTPRequestValidationHandler
import io.vertx.ext.web.validation.ValidationException

class UsersRouter(internal var vertx: Vertx) {

    val router: Router
        get() {
            val router = Router.router(vertx)

            router.get("/:user_id")
                    .handler(HTTPRequestValidationHandler.create()
                            .addPathParamWithPattern("user_id", "[0-9]{4}[a-zA-Z]{6}"))
                    .handler { routingContext ->
                        val params = routingContext.get<Any>("parsedParameters")
                        val user_id = params.pathParameter("user_id").getString()
                        // Now handle user_id
                    }
                    .failureHandler { routingContext ->
                        if (routingContext.failure() is ValidationException) {
                            routingContext.response().setStatusCode(400).end(routingContext.failure().message)
                        } else {
                            // Handle your failure
                        }
                    }
            return router
        }

}

