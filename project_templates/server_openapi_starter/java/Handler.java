package {{#if project_info.package}}{{ project_info.package }}.{{/if}}handlers;

import io.vertx.core.Handler;
import io.vertx.ext.web.RequestParameters;
import io.vertx.ext.web.RoutingContext;

public class {{ class_name }} implements Handler<RoutingContext> {

    public {{ class_name }}(){

    }

    @Override
    public void handle(RoutingContext routingContext) {
        {{#if renderParams}}RequestParameters params = routingContext.get("parsedParameters");
        {{/if}}// Handle {{ operation.operationId }}
        routingContext.response().setStatusCode(501).setStatusMessage("Not Implemented").end();
    }

}