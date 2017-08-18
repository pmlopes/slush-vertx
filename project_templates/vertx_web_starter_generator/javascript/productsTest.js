let TestSuite = require("vertx-unit-js/test_suite");
let WebClient = require("vertx-web-client-js/web_client");

let suite = TestSuite.create("io.vertx.example.unit.test.ProductsTest");

const port = 8080;
const host = "localhost";

let client;

suite.before(context => {
    let async = context.async();
    vertx.deployVerticle("bundle.js", {
        options: {
            "http.port": port,
            "http.host": host
        }
    }, (res, err) => {
        if (!err) {
            client = WebClient.create(vertx, {
                "defaultPort": port,
                "defaultHost": host
            });
            async.complete();
        } else {
            context.fail(err);
            async.complete();
        }
    });
});

suite.test("testAddNewProduct", function (context) {
    var async = context.async();
    var jsonObject = { "name": "Vertx" };
    client.post("/products/addNewProduct").sendJson(jsonObject, (result, err) => {
        if (!err) {
            context.assertEquals(200, result.statusCode());
            // Do some asserts
            async.complete();
        } else {
            context.fail(err);
        }
    });
});

module.exports = suite.run();