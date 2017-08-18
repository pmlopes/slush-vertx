{{#if package }}package {{ package }};

{{/if}}import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;
import io.vertx.core.VertxOptions;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.Async;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.client.WebClientOptions;

public class BaseTest {

    final int PORT = 8080;
    final String HOST = "localhost";

    Vertx vertx;
    String deploymentId;
    WebClient webClient;

    public void before(TestContext context) {
        vertx = Vertx.vertx(new VertxOptions().setMaxEventLoopExecuteTime(Long.MAX_VALUE));
        Async async = context.async();
        DeploymentOptions options = new DeploymentOptions().setConfig(
                new JsonObject()
                        .put("http.port", PORT)
                        .put("http.host", HOST));
        vertx.deployVerticle(MainVerticle.class.getName(), options, res -> {
            if (res.succeeded()) {
                deploymentId = res.result();
                webClient = WebClient
                        .create(vertx, new WebClientOptions().setDefaultPort(PORT).setDefaultHost(HOST));
                async.complete();
            } else {
                context.fail("Verticle deployment failed!");
                async.complete();
            }
        });
    }

    public void after(TestContext context) {
        webClient.close();
        vertx.close(context.asyncAssertSuccess());
    }
}
