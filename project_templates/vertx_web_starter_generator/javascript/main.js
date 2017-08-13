let Router = require('vertx-web-js/router');

let ProductsRouter = require('./products/productsRouter.js');
let UsersRouter = require('./users/usersRouter.js');

let products = new ProductsRouter(vertx);
let users = new UsersRouter(vertx);

let router = Router.router(vertx);

router.mountSubRouter("/users", users.getRouter());
router.mountSubRouter("/products", products.getRouter());

let options = {
    "port": vertx.getOrCreateContext().config()["http.port"],
    "host": vertx.getOrCreateContext().config()["http.host"]
};

let server = vertx.createHttpServer(options);
server.requestHandler(router.accept).listen();
