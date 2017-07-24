package {{#if project_info.package}}{{ project_info.package }}.{{/if}}securityHandlers;

import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;

class {{ class_name }}: Handler<RoutingContext> {

    override fun handle(routingContext: RoutingContext) {
        // Handle your security
        routingContext.next()
    }

}