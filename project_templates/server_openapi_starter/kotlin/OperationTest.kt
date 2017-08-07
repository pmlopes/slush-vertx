{{#if project_info.package}}package {{ project_info.package }};

{{/if}}import io.vertx.core.AsyncResult
import io.vertx.core.Handler
import io.vertx.ext.unit.TestContext
import io.vertx.ext.unit.junit.VertxUnitRunner
import io.vertx.core.MultiMap
import io.vertx.core.buffer.Buffer
import io.vertx.core.streams.ReadStream
import io.vertx.core.json.JsonObject
import io.vertx.ext.web.client.HttpResponse
import org.junit.Test
import org.junit.runner.RunWith

/**
 * {{ operation.operationId }} Test
 */
@RunWith(VertxUnitRunner::class)
class {{ operation.test_class_name }} : BaseTest() {

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

{{#forOwn operation.responses}}    @Test
    fun test{{capitalize @key}}(test: TestContext) {
        val async = test.async({{length .././operation/functions}});
{{#each .././operation/parameters.path}}        var {{name}}: {{languageType}} = null;
{{/each}}{{#each .././operation/parameters.cookie}}        var {{name}}: {{languageType}} = null;
{{/each}}{{#each .././operation/parameters.query}}        var {{name}}: {{languageType}} = null;
{{/each}}{{#each .././operation/parameters.header}}        var {{name}}: {{languageType}} = null;
{{/each}}
{{#each .././operation/functions}}

        // TODO set parameters for {{name}} request
{{#each ../.././operation/parameters.path}}        {{name}} = null;
{{/each}}{{#each ../.././operation/parameters.cookie}}        {{name}} = null;
{{/each}}{{#each ../.././operation/parameters.query}}        {{name}} = null;
{{/each}}{{#each ../.././operation/parameters.header}}        {{name}} = null;
{{/each}}{{#if json}}        var body = JsonObject();
{{else if form}}        var form = MultiMap.caseInsensitiveMultiMap();
{{else if stream}}        var stream: ReadStream<Buffer>? = null;
{{else if buffer}}        var buffer: Buffer? = null;
{{/if}}        apiClient.{{name}}({{#each ../.././operation/parameters.path}}{{name}}, {{/each}}{{#each ../.././operation/parameters.cookie}}{{name}}, {{/each}}{{#each ../.././operation/parameters.query}}{{name}}, {{/each}}{{#each ../.././operation/parameters.header}}{{name}}, {{/each}}{{#if json}}body, {{else if form}}form, {{else if stream}}stream, {{else if buffer}}buffer, {{/if}}Handler { ar ->
            if (ar.succeeded()) {
                {{#compare ../status_code '!=' 'default'}}test.assertEquals({{../status_code}}, ar.result().statusCode());{{/compare}}
                //TODO add your asserts
            } else {
                ar.cause().printStackTrace();
                test.fail("Request {{name}} failed");
            }
            async.countDown();
        });
{{/each}}
    }

{{/forOwn}}

}