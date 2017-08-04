package {{#if project_info.package}}{{ project_info.package }}.{{/if}}securityHandlers;

import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;

class {{ security_schema.class_name }}: Handler<RoutingContext> {

    override fun handle(routingContext: RoutingContext) {
        // Handle {{ security_schema.schema_name }} security schema
        routingContext.next()
    }

}