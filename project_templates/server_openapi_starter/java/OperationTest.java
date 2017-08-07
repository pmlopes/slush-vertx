{{#if project_info.package}}package {{ project_info.package }};

{{/if}}import io.vertx.ext.web.client.HttpResponse;
import io.vertx.core.AsyncResult;
import io.vertx.ext.unit.Async;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import io.vertx.core.json.JsonObject;
import io.vertx.core.MultiMap;
import org.junit.*;
import org.junit.runner.RunWith;

/**
 * {{ operation.operationId }} Test
 */
@RunWith(VertxUnitRunner.class)
public class {{ operation.test_class_name }} extends BaseTest {

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

{{#forOwn operation.responses}}    @Test
    public void test{{capitalize @key}}(TestContext test) {
        Async async = test.async({{length .././operation/functions}});
{{#each .././operation/parameters.path}}        {{languageType}} {{name}} = null;
{{/each}}{{#each .././operation/parameters.cookie}}        {{languageType}} {{name}} = null;
{{/each}}{{#each .././operation/parameters.query}}        {{languageType}} {{name}} = null;
{{/each}}{{#each .././operation/parameters.header}}        {{languageType}} {{name}} = null;
{{/each}}
{{#each .././operation/functions}}

        // TODO set parameters for {{name}} request
{{#each ../.././operation/parameters.path}}        {{name}} = null;
{{/each}}{{#each ../.././operation/parameters.cookie}}        {{name}} = null;
{{/each}}{{#each ../.././operation/parameters.query}}        {{name}} = null;
{{/each}}{{#each ../.././operation/parameters.header}}        {{name}} = null;
{{/each}}{{#if json}}        JsonObject body = new JsonObject();
{{else if form}}        MultiMap form = MultiMap.caseInsensitiveMultiMap();
{{else if stream}}        ReadStream<Buffer> stream = null;
{{else if buffer}}        Buffer buffer = null;
{{/if}}        apiClient.{{name}}({{#each ../.././operation/parameters.path}}{{name}}, {{/each}}{{#each ../.././operation/parameters.cookie}}{{name}}, {{/each}}{{#each ../.././operation/parameters.query}}{{name}}, {{/each}}{{#each ../.././operation/parameters.header}}{{name}}, {{/each}}{{#if json}}body, {{else if form}}form, {{else if stream}}stream, {{else if buffer}}buffer, {{/if}}(AsyncResult<HttpResponse> ar) -> {
            if (ar.succeeded()) {
                {{#compare ../status_code '!=' 'default'}}test.assertEquals({{../status_code}}, ar.result().statusCode());{{/compare}}
                //TODO add your asserts
            } else {
                test.fail("Request failed");
            }
            async.countDown();
        });
{{/each}}
    }

{{/forOwn}}

}