import io.vertx.core.Handler;
import io.vertx.ext.web.RequestParameters;
import io.vertx.ext.web.RoutingContext;

class {{ operation.class_name }} implements Handler<RoutingContext> {

    {{ operation.class_name }}(){

    }

    @Override
    void handle(RoutingContext routingContext) {
        {{#if renderParams}}RequestParameters params = routingContext.get("parsedParameters");
        {{/if}}// Handle {{ operation.operationId }}
        routingContext.response().setStatusCode(501).setStatusMessage("Not Implemented").end();
    }

}