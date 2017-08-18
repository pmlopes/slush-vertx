{{#if package }}package {{ package }}

{{/if}}import io.vertx.core.DeploymentOptions
import io.vertx.core.Vertx
import io.vertx.core.VertxOptions
import io.vertx.core.json.JsonObject
import io.vertx.ext.unit.Async
import io.vertx.ext.unit.TestContext
import io.vertx.ext.web.client.WebClient
import io.vertx.ext.web.client.WebClientOptions

open class BaseTest {

   internal val PORT = 8080
   internal val HOST = "localhost"

   internal lateinit var vertx: Vertx
   internal lateinit var deploymentId: String
   internal lateinit var webClient: WebClient

   open fun before(context: TestContext) {
       vertx = Vertx.vertx(VertxOptions().setMaxEventLoopExecuteTime(java.lang.Long.MAX_VALUE))
       val async = context.async()
       val options = DeploymentOptions().setConfig(
               JsonObject()
                       .put("http.port", PORT)
                       .put("http.host", HOST))
       vertx.deployVerticle(MainVerticle::class.java!!.getName(), options) { res ->
           if (res.succeeded()) {
               deploymentId = res.result()
               webClient = WebClient
                       .create(vertx, WebClientOptions().setDefaultPort(PORT).setDefaultHost(HOST))
               async.complete()
           } else {
               context.fail("Verticle deployment failed!")
               async.complete()
           }
       }
   }

   open fun after(context: TestContext) {
       webClient.close()
       vertx.close(context.asyncAssertSuccess<Void>())
   }
}
