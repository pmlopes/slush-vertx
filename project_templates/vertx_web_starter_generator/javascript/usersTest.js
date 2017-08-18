let TestSuite = require("vertx-unit-js/test_suite");
let WebClient = require("vertx-web-client-js/web_client");

let suite = TestSuite.create("io.vertx.example.unit.test.UsersTest");

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

suite.test("testGetUser", function (context) {
    var async = context.async(2);
    client.get("/users/badId").send((res, err) => {
        if (!err) {
            context.assertEquals(400, res.statusCode());
            async.countDown();
        } else {
            context.fail(err);
        }
    });
    client.get("/users/2141btrthh").send((res, err) => {
        if (!err) {
            context.assertEquals(200, res.statusCode());
            // Do some asserts
            async.countDown();
        } else {
            context.fail(err);
        }
    });
});

module.exports = suite.run();