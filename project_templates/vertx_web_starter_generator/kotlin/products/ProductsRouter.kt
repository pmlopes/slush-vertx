{{#if package }}package {{ package }}.products

{{else}}package products

{{/if}}import io.vertx.core.Vertx
import io.vertx.core.json.JsonObject
import io.vertx.ext.web.Router

class ProductsRouter(internal var vertx: Vertx) {

    val router: Router
        get() {
            val router = Router.router(vertx)

            router.post("/addNewProduct")
                    .handler { routingContext ->
                        val obj = routingContext.bodyAsJson
                        // Handle the new product
                    }
                    .failureHandler { routingContext ->
                        // Handle your failure
                    }
            return router
        }

}

