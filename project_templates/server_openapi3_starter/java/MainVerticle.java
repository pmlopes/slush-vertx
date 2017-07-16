{{#if project_info.package}}package {{ project_info.package }};

{{/if}}import io.vertx.core.AbstractVerticle;

public class MainVerticle extends AbstractVerticle {

  @Override
  public void start() {
    OpenAPI3RouterFactory.createRouterFactoryFromFile(this.vertx, "{{ openapispec_path }}", openAPI3RouterFactoryAsyncResult -> {
      if (openAPI3RouterFactoryAsyncResult.succeeded()) {
        OpenAPI3RouterFactory routerFactory = openAPI3RouterFactoryAsyncResult.result();

        {{#each operations}}
        routerFactory.addHandlerByOperationId("{{ operationId }}", new {{#if ../project_info.package}}{{ ../project_info.package }}.{{/if}}handlers.{{ class_name }}());
        {{/each}}

        Router router = routerFactory.getRouter();
        HttpServer server = vertx.createHttpServer(new HttpServerOptions().setPort(8080).setHost("localhost"));
        server.requestHandler(router::accept).listen();
      } else {
          // Something went wrong during router factory initialization
          Throwable exception = openAPI3RouterFactoryAsyncResult.cause();
      }
    });
  }

}
