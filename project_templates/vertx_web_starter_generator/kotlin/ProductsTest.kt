{{#if package }}package {{ package }}

{{/if}}import io.vertx.core.json.JsonObject
import io.vertx.ext.unit.Async
import io.vertx.ext.unit.TestContext
import io.vertx.ext.unit.junit.VertxUnitRunner
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(VertxUnitRunner::class)
class ProductsTest : BaseTest() {
    @Before
    override fun before(context: TestContext) {
        super.before(context)
        //TODO add some test initialization code like security token retrieval
    }

    @After
    override fun after(context: TestContext) {
        //TODO add some test end code like session destroy
        super.after(context)
    }

    @Test
    @Throws(Exception::class)
    fun testAddNewProduct(test: TestContext) {
        val async = test.async()
        val jsonObject = JsonObject().put("name", "Vertx")
        webClient.post("/products/addNewProduct").sendJson(jsonObject) { ar ->
            if (ar.succeeded()) {
                // Do some asserts
                async.complete()
            } else {
                test.fail(ar.cause())
            }
        }
    }
}
