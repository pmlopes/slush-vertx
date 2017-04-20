package {{ groupId }};

import io.vertx.core.AbstractVerticle;

public class {{ verticleName }} extends AbstractVerticle {

  @Override
  public void start() {
    // your code goes here...
    vertx.createHttpServer().requestHandler(req -> {
      req.response()
        .putHeader("content-type", "text/plain")
        .end("Hello from Vert.x!");
    }).listen(8080);
  }
}
