package {{#if project_info.package}}{{ project_info.package }}.{{/if}}securityHandlers;

import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;

class {{ class_name }} implements Handler<RoutingContext> {

    {{ class_name }}(){

    }

    @Override
    void handle(RoutingContext routingContext) {
        // Handle your security
        routingContext.next();
    }

}