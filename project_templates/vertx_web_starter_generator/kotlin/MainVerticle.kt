{{#if package }}package {{ package }}

{{/if}}import {{#if package }}{{ package }}.{{/if}}products.ProductsRouter
import {{#if package }}{{ package }}.{{/if}}users.UsersRouter
import io.vertx.core.AbstractVerticle
import io.vertx.core.http.HttpServer
import io.vertx.core.http.HttpServerOptions
import io.vertx.ext.web.Router

class MainVerticle : AbstractVerticle() {

    override fun start() {
        val users = UsersRouter(vertx)
        val products = ProductsRouter(vertx)

        val router = Router.router(vertx)

        router.mountSubRouter("/users", users.router)
        router.mountSubRouter("/products", products.router)

        val server = vertx.createHttpServer(
                HttpServerOptions()
                        .setPort(config().getInteger("http.port", 8080)!!)
                        .setHost(config().getString("http.host", "localhost")))
        server.requestHandler(router::accept).listen()
    }
}
