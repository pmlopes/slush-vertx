{{#if package }}package {{ package }};

{{/if}}import io.vertx.core.AbstractVerticle

class MainVerticle extends AbstractVerticle {

    @Override
    void start() {
        vertx.createHttpServer().requestHandler({
            it.response().putHeader("content-type", "text/html").end("<html><body><h1>Hello from vert.x!</h1></body></html>")
        }).listen(8080)
    }

}