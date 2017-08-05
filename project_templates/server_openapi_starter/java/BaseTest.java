{{#if project_info.package}}package {{ project_info.package }};

{{/if}}import io.vertx.core.Vertx;
import io.vertx.ext.unit.Async;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.runner.RunWith;

@RunWith(VertxUnitRunner.class)
public class BaseTest {

    Vertx vertx;
    String deploymentId;
    ApiClient apiClient;

    @BeforeClass
    public void before(TestContext context) {
        vertx = Vertx.vertx();
        MainVerticle myVerticle = new MainVerticle();
        Async async = context.async();
        vertx.deployVerticle(myVerticle, res -> {
            if (res.succeeded()) {
                deploymentId = res.result();
                apiClient = new ApiClient(vertx, "localhost", 8080);
                async.complete();
            } else {
                System.out.println("Verticle deployment failed!");
            }
        });
        async.awaitSuccess();
    }

    @AfterClass
    public void after(TestContext context) {
        apiClient.close();
        vertx.undeploy(deploymentId);
        vertx.close(context.asyncAssertSuccess());
    }
}
