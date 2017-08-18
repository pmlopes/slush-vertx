{{#if package }}package {{ package }};

{{/if}}import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.Async;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(VertxUnitRunner.class)
public class ProductsTest extends BaseTest {
    @Override
    @Before
    public void before(TestContext context) {
        super.before(context);
        //TODO add some test initialization code like security token retrieval
    }

    @Override
    @After
    public void after(TestContext context) {
        //TODO add some test end code like session destroy
        super.after(context);
    }

    @Test
    public void testAddNewProduct(TestContext test) throws Exception {
        Async async = test.async();
        JsonObject jsonObject = new JsonObject().put("name", "Vertx");
        webClient.post("/products/addNewProduct").sendJson(jsonObject, ar -> {
            if (ar.succeeded()) {
                // Do some asserts
                async.complete();
            } else {
                test.fail(ar.cause());
            }
        });
    }
}
