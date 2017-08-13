import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;

class {{ security_schema.class_name }} implements Handler<RoutingContext> {

    {{ security_schema.class_name }}(){

    }

    @Override
    void handle(RoutingContext routingContext) {
        // Handle {{ security_schema.schema_name }} security schema
        routingContext.next();
    }

}