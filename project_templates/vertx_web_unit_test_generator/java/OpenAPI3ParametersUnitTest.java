{{#if project_info.package}}package {{ project_info.package }};

{{/if}}import com.reprezen.kaizen.oasparser.OpenApiParser;
import com.reprezen.kaizen.oasparser.model3.OpenApi3;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerOptions;
import io.vertx.core.json.JsonObject;
import io.vertx.core.json.JsonArray;
import io.vertx.ext.web.RequestParameter;
import io.vertx.ext.web.RequestParameters;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.ext.web.designdriven.openapi3.impl.OpenAPI3RouterFactoryImpl;
import io.vertx.ext.web.validation.WebTestValidationBase;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExternalResource;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.stream.Collectors;

/**
 * @author Francesco Guardiani @slinkydeveloper
 */
public class OpenAPI3ParametersUnitTest extends WebTestValidationBase {

  OpenApi3 spec;
  ApiClient apiClient;
  OpenAPI3RouterFactory routerFactory;

  @Rule
  public ExternalResource resource = new ExternalResource() {
    @Override
    protected void before() throws Throwable {
      spec = loadSwagger("src/test/resources/swaggers/openapi.yaml");
    }

    @Override
    protected void after() {}
  };

  @Override
  public void setUp() throws Exception {
    super.setUp();
    stopServer(); // Have to stop default server of WebTestBase
    apiClient = new ApiClient(webClient);
    routerFactory = new OpenAPI3RouterFactoryImpl(this.vertx, spec);
    routerFactory.enableValidationFailureHandler(true);
    routerFactory.setValidationFailureHandler(generateFailureHandler());
    routerFactory.mountOperationsWithoutHandlers(false);
  }

  @Override
  public void tearDown() throws Exception {
    if (apiClient != null) {
      try {
        apiClient.close();
      } catch (IllegalStateException e) {}
    }
    stopServer();
    super.tearDown();
  }


  {{#forOwn operations}}
  /**
   * Test: {{@key}}
   * Expected parameters sent:
   {{#each parameters}}* {{name}}: {{examples.spec.value}}
   {{/each}}* Expected response: {{exampleResponse}}
   * @throws Exception
   */
  @Test
  public void test{{capitalize sanitized_operation_id}}() throws Exception {
    routerFactory.addHandlerByOperationId("{{operationId}}", routingContext -> {
      RequestParameters params = routingContext.get("parsedParameters");
      JsonObject res = new JsonObject();

      {{#each parameters}}
      RequestParameter {{sanitized_name}}_{{in}} = params.{{in}}Parameter("{{name}}");
      assertNotNull({{sanitized_name}}_{{in}});
      {{#compare x-test '==' 'empty'}}assertTrue({{sanitized_name}}_{{in}}.isEmpty());
      res.putNull("{{name}}");
      {{/compare}}{{#compare x-test '==' 'string'}}assertTrue({{sanitized_name}}_{{in}}.isString());
      assertEquals({{sanitized_name}}_{{in}}.getString(), "{{examples.value.value}}");
      res.put("{{name}}", {{sanitized_name}}_{{in}}.getString());
      {{/compare}}{{#compare x-test '==' 'array'}}assertTrue({{sanitized_name}}_{{in}}.isArray());
      res.put("{{name}}", new JsonArray({{sanitized_name}}_{{in}}.getArray().stream().map(param -> param.getString()).collect(Collectors.toList())));
      {{/compare}}{{#compare x-test '==' 'object'}}assertTrue({{sanitized_name}}_{{in}}.isObject());
      Map<String, String> map = new HashMap<>();
      for (String key : {{sanitized_name}}_{{in}}.getObjectKeys())
        map.put(key, {{sanitized_name}}_{{in}}.getObjectValue(key).getString());
      res.put("{{name}}", map);
      {{/compare}}{{/each}}

      routingContext.response()
        .setStatusCode(200)
        .setStatusMessage("OK")
        .putHeader("content-type", "application/json; charset=utf-8")
        .end(res.encode());
    });

    CountDownLatch latch = new CountDownLatch(1);

    {{#each parameters}}
    {{languageType}} {{sanitized_name}}_{{in}};
    {{#compare x-test '==' 'empty'}}{{sanitized_name}}_{{in}} = "";
    {{/compare}}{{#compare x-test '==' 'string'}}{{sanitized_name}}_{{in}} = "{{examples.value.value}}";
    {{/compare}}{{#compare x-test '==' 'array'}}{{sanitized_name}}_{{in}} = new ArrayList<>();
    {{#each examples.value.value}}{{../sanitized_name}}_{{../in}}.add("{{.}}");
    {{/each}}
    {{/compare}}{{#compare x-test '==' 'object'}}{{sanitized_name}}_{{in}} = new HashMap<>();
    {{#forOwn examples.value.value}}{{../sanitized_name}}_{{../in}}.put("{{@key}}", "{{.}}");
    {{/forOwn}}
    {{/compare}}{{/each}}

    startServer();

    apiClient.{{sanitized_operation_id}}({{#each parameters}}{{sanitized_name}}_{{in}}, {{/each}}(AsyncResult<HttpResponse> ar) -> {
      if (ar.succeeded()) {
        assertEquals(200, ar.result().statusCode());
        assertTrue("Expected: " + new JsonObject("{{escape exampleResponse}}").encode() + " Actual: " + ar.result().bodyAsJsonObject().encode(), new JsonObject("{{escape exampleResponse}}").equals(ar.result().bodyAsJsonObject()));
      } else {
        assertTrue(ar.cause().getMessage(), false);
      }
      latch.countDown();
    });
    awaitLatch(latch);

  }

  {{/forOwn}}

  private OpenApi3 loadSwagger(String filename) {
    return (OpenApi3) new OpenApiParser().parse(new File(filename), false);
  }

  public Handler<RoutingContext> generateFailureHandler() {
    return routingContext -> {
      Throwable failure = routingContext.failure();
      failure.printStackTrace();
      assertTrue(failure.getMessage(), false);
    };
  }

  private void startServer() throws Exception {
    router = routerFactory.getRouter();
    server = this.vertx.createHttpServer(new HttpServerOptions().setPort(8080).setHost("localhost"));
    CountDownLatch latch = new CountDownLatch(1);
    server.requestHandler(router::accept).listen(onSuccess(res -> {
      latch.countDown();
    }));
    awaitLatch(latch);
  }

  private void stopServer() throws Exception {
    if (server != null) {
      CountDownLatch latch = new CountDownLatch(1);
      try {
        server.close((asyncResult) -> {
          latch.countDown();
        });
      } catch (IllegalStateException e) { // Server is already open
        latch.countDown();
      }
      awaitLatch(latch);
    }
  }
}