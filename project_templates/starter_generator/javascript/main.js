let server;

server = vertx.createHttpServer();

server.requestHandler((req) => {
    req.response()
        .putHeader("content-type", "text/plain")
        .end("Hello from Vert.x!");
}).listen(8080);

console.log("Started listening!");
