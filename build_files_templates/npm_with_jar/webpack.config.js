// webpack.config.js
var path = require('path');
const VertxPlugin = require('webpack-vertx-plugin');

module.exports = {

  entry: path.resolve(__dirname, '{{ src_dir }}/{{ main }}'),

  output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'build')
  },

  module: {
      loaders: [
          { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
      ]
  },

  plugins: [
      new VertxPlugin({verbose: true})
  ]
};
