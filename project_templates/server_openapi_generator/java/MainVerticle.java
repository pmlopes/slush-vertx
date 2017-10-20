{{#if project_info.package}}package {{ project_info.package }};

{{/if}}import io.vertx.core.AbstractVerticle;
import io.vertx.core.http.HttpServer;
import io.vertx.core.http.HttpServerOptions;
import io.vertx.ext.web.api.contract.openapi3.OpenAPI3RouterFactory;
import io.vertx.ext.web.Router;
import io.vertx.core.Future;

public class MainVerticle extends AbstractVerticle {

  HttpServer server;

  @Override
  public void start(Future future) {
    OpenAPI3RouterFactory.createRouterFactoryFromFile(this.vertx, getClass().getResource("/{{ project_info.spec_filename }}").getFile(), openAPI3RouterFactoryAsyncResult -> {
      if (openAPI3RouterFactoryAsyncResult.succeeded()) {
        OpenAPI3RouterFactory routerFactory = openAPI3RouterFactoryAsyncResult.result();

        // Enable automatic response when ValidationException is thrown
        routerFactory.enableValidationFailureHandler(true);

        // Add routes handlers
        {{#each operations}}
        routerFactory.addHandlerByOperationId("{{ operationId }}", new {{#if ../project_info.package}}{{ ../project_info.package }}.{{/if}}handlers.{{ class_name }}());
        {{/each}}

        {{#if security_schemas}}
        // Add security handlers
        {{#each security_schemas}}
        routerFactory.addSecurityHandler("{{ schema_name }}", new {{#if ../project_info.package}}{{ ../project_info.package }}.{{/if}}securityHandlers.{{ class_name }}());
        {{/each}}
        {{/if}}

        // Generate the router
        Router router = routerFactory.getRouter();
        server = vertx.createHttpServer(new HttpServerOptions().setPort(8080).setHost("localhost"));
        server.requestHandler(router::accept).listen();
        future.complete();
      } else {
          // Something went wrong during router factory initialization
          Throwable exception = openAPI3RouterFactoryAsyncResult.cause();
      }
    });
  }

  @Override
  public void stop(){
    this.server.close();
  }

}
