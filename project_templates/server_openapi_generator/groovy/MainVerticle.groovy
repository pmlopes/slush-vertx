import io.vertx.core.AbstractVerticle
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServer
import io.vertx.core.http.HttpServerOptions;
import io.vertx.ext.web.designdriven.openapi3.OpenAPI3RouterFactory;
import io.vertx.core.Future;

class MainVerticle extends AbstractVerticle {

    HttpServer server;

    @Override
    void start(Future future) {
        OpenAPI3RouterFactory.createRouterFactoryFromURL(this.vertx, getClass().getResource("/{{ project_info.spec_filename }}").toString(), false, {
            if (it.succeeded()) {
                def routerFactory = it.result();

                // Enable automatic response when ValidationException is thrown
                routerFactory.enableValidationFailureHandler(true);

                // Add routes handlers
                {{#each operations}}
                routerFactory.addHandlerByOperationId("{{ operationId }}", new {{ class_name }}());
                {{/each}}

                {{#if security_schemas}}
                // Add security handlers
                {{#each security_schemas}}
                routerFactory.addSecurityHandler("{{ schema_name }}", new {{ class_name }}());
                {{/each}}
                {{/if}}

                // Generate the router
                def router = routerFactory.getRouter();
                server = vertx.createHttpServer(new HttpServerOptions([
                        port: 8080,
                        host: "localhost"
                ]));
                server.requestHandler(router.&accept).listen();
                future.complete()

            } else {
                // Something went wrong during router factory initialization
                def exception = openAPI3RouterFactoryAsyncResult.cause();
            }
        });
    }

}