package {{ groupId }}

import io.vertx.core.AbstractVerticle

class {{ verticleName }} : AbstractVerticle() {

  override fun start() {
    // your code goes here...
    vertx.createHttpServer().requestHandler({ req ->
      req.response()
        .putHeader("content-type", "text/plain")
        .end("Hello from Vert.x!")
    }).listen(8080)
  }
}
