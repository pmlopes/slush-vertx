package {{#if project_info.package}}{{ project_info.package }}.{{/if}}handlers;

import io.vertx.core.Handler;

public class {{ class_name }} extends Handler<RoutingContext> {

    @Override
    public void handle(RoutingContext routingContext) {
        {{#if renderParams}} RequestParameters params = routingContext.get("parsedParameters"); {{/if}}
        // Handle {{ operation.operationId }}
        routingContext.response().setStatusCode(501).setStatusMessage("Not Implemented").end();
    }

}