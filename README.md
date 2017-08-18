# slush-vertx

Scaffold with [Slush][slush-url] your new Vert.x application!

slush-vertx is a collection of template driven code generators to scaffold Vert.x projects based on language and build tool used.

## Generators

| Generator | Description | Java | Kotlin | Javascript | Groovy | Ruby |
|-----------|-------------|------|--------|------------|--------|------|
| **Vert.x Starter project** | Generate an empty project configured for Vert.x 3 Framework |:heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| **Vert.x Web Server Starter** | Generate a skeleton with sources and tests for Vert.x 3 Web powered REST server | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x: | :x: |
| **Vert.x Web Server OpenAPI project** | Generate a skeleton based on Swagger 2/OpenAPI 3 specification with sources and tests for Vert.x 3 Web powered REST server | :heavy_check_mark: | :heavy_check_mark: | :x: | :heavy_check_mark: | :x: |
| **Vert.x Web Client OpenAPI project** | Generate a client based on a Swagger 2/OpenAPI 3 specification | :heavy_check_mark: | :heavy_check_mark: | :x: | :heavy_check_mark: | :x: |

List of supported build tools:

* Maven
* Gradle
* NPM
* NPM with jar packaging (thanks to [Vert.x Webpack plugin](https://github.com/pmlopes/webpack-vertx-plugin))

If you want to add your own generator and/or build tool give a look at [how to contribute](https://github.com/pmlopes/slush-vertx/wiki/How-to-contribute)

## Install

1. Install [`gulp.js`][gulp-url]
2. Install [Slush][slush-url]
3. Install the [`slush-vertx`][generator-url] generator

```sh
$ npm install -g gulp slush slush-vertx
```

## Usage

[![asciicast](demo.gif)](https://asciinema.org/a/lR23OQrMnDY6zZNggh8kgUAE4)

## Contribute

If you want to add a generator, add templates to an existing generator or something else give a look at [how to contribute](https://github.com/pmlopes/slush-vertx/wiki/How-to-contribute)

## License

MIT © [Paulo Lopes](http://jetdrone.xyz) and [Francesco Guardiani](http://slinkydeveloper.github.io)

[slush-url]: http://slushjs.github.io
[gulp-url]: http://gulpjs.com
[generator-url]: https://github.com/pmlopes/slush-vertx
