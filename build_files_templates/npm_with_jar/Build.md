## Build configuration for {{capitalize project_name}}

This project configuration uses [babel](babeljs.io) to transpile es6 or newer to es5 and builds a jar package.

### Build and run
To build your project run:

```bash
npm install
npm run build
```

The build command uses [webpack](https://webpack.js.org/) and [Vert.x Webpack plugin](https://github.com/pmlopes/webpack-vertx-plugin) to import all maven dependencies into `node_modules` and create jar package. If you want to add other Vert.x modules or external Java dependencies, add it to `pom.xml` and they will loaded inside the jar.

To run your project run:

```bash
npm start
```

This command executes the jar created during the building {{#if templates.config}}and automatically loads the configuration file{{/if}}{{#if templates.test}}

### Write and run tests
You can use [Vert.x unit](http://vertx.io/docs/vertx-unit/js/) to create unit tests. To build and run unit tests run:

```bash
npm test
```

This command builds the unit tests and puts these in `build_test`. Then it runs all files in `build_test` that ends with `test.js` or `Test.js`.

{{/if}}