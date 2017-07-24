{{#if project_info.package}}package {{ project_info.package }};

{{/if}}import io.vertx.core.AbstractVerticle
import io.vertx.core.http.HttpServer
import io.vertx.core.http.HttpServerOptions
import io.vertx.ext.web.designdriven.openapi3.OpenAPI3RouterFactory
import io.vertx.ext.web.Router

class MainVerticle : AbstractVerticle() {

    var server: HttpServer? = null

    override fun start() {
        OpenAPI3RouterFactory.createRouterFactoryFromURL(vertx, MainVerticle::class.java.getResource("/{{ openapispec_filename }}").toString(), false, { openAPI3RouterFactoryAsyncResult ->
            if (openAPI3RouterFactoryAsyncResult.succeeded()) {
                var routerFactory: OpenAPI3RouterFactory = openAPI3RouterFactoryAsyncResult.result();

                // Enable automatic response when ValidationException is thrown
                routerFactory.enableValidationFailureHandler(true);

                // Add routes handlers
                {{#each operations}}
                routerFactory.addHandlerByOperationId("{{ operationId }}", {{#if ../project_info.package}}{{ ../project_info.package }}.{{/if}}handlers.{{ class_name }}());
                {{/each}}

                {{#if security_schemas}}
                // Add security handlers
                {{#each security_schemas}}
                routerFactory.addSecurityHandler("{{ schema_name }}", {{#if ../project_info.package}}{{ ../project_info.package }}.{{/if}}securityHandlers.{{ class_name }}());
                {{/each}}
                {{/if}}

                // Generate the router
                var router : Router = routerFactory.getRouter();
                server = vertx.createHttpServer(HttpServerOptions().setPort(8080).setHost("localhost"));
                println("Server listening!")
                server?.requestHandler(router::accept)?.listen();
            } else {
                // Something went wrong during router factory initialization
                var exception: Throwable = openAPI3RouterFactoryAsyncResult.cause();
            }
        });
    }

    override fun stop(){
        this.server?.close()
    }

}
