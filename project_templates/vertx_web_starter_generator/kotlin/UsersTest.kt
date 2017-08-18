{{#if package }}package {{ package }}

{{/if}}import io.vertx.ext.unit.Async
import io.vertx.ext.unit.TestContext
import io.vertx.ext.unit.junit.VertxUnitRunner
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(VertxUnitRunner::class)
class UsersTest : BaseTest() {
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
    fun testGetUser(test: TestContext) {
        val async = test.async(2)
        webClient.get("/users/badId").send { ar ->
            if (ar.succeeded()) {
                test.assertEquals(400, ar.result().statusCode())
                async.countDown()
            } else {
                test.fail(ar.cause())
            }
        }
        webClient.get("/users/2141btrthh").send { ar ->
            if (ar.succeeded()) {
                // Do some asserts
                async.countDown()
            } else {
                test.fail(ar.cause())
            }
        }
    }
}
