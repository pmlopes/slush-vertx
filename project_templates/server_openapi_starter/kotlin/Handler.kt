package {{#if project_info.package}}{{ project_info.package }}.{{/if}}handlers;

import io.vertx.core.Handler
import io.vertx.ext.web.RequestParameters
import io.vertx.ext.web.RoutingContext

class {{ operation.class_name }} : Handler<RoutingContext> {
    override fun handle(routingContext: RoutingContext) {
        {{#if renderParams}}var params: RequestParameters = routingContext.get("parsedParameters")
        {{/if}}// Handle {{ operation.operationId }}
        routingContext.response().setStatusCode(501).setStatusMessage("Not Implemented").end()
    }
}