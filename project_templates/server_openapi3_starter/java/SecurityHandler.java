package {{#if project_info.package}}{{ project_info.package }}.{{/if}}securityHandlers;

import io.vertx.core.Handler;

public class {{ class_name }} extends Handler<RoutingContext> {

    @Override
    public void handle(RoutingContext routingContext) {
        // Handle your security
        routingContext.next();
    }

}