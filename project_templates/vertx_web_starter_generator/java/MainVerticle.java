{{#if package }}package {{ package }};

{{/if}}import {{#if package }}{{ package }}.{{/if}}products.ProductsRouter;
import {{#if package }}{{ package }}.{{/if}}users.UsersRouter;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.http.HttpServer;
import io.vertx.core.http.HttpServerOptions;
import io.vertx.ext.web.Router;

public class MainVerticle extends AbstractVerticle {

    @Override
    public void start() {
        UsersRouter users = new UsersRouter(vertx);
        ProductsRouter products = new ProductsRouter(vertx);

        Router router = Router.router(vertx);

        router.mountSubRouter("/users", users.getRouter());
        router.mountSubRouter("/products", products.getRouter());

        HttpServer server = vertx.createHttpServer(
                new HttpServerOptions()
                        .setPort(config().getInteger("http.port", 8080))
                        .setHost(config().getString("http.host", "localhost")));
        server.requestHandler(router::accept).listen();
    }
}
