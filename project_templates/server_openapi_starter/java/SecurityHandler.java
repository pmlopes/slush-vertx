package {{#if project_info.package}}{{ project_info.package }}.{{/if}}securityHandlers;

import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;

public class {{ class_name }} implements Handler<RoutingContext> {

    public {{ class_name }}(){

    }

    @Override
    public void handle(RoutingContext routingContext) {
        // Handle your security
        routingContext.next();
    }

}