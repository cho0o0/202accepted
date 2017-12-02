const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: [
    'themes/202accepted/source/js/index.js',
  ],
  resolve: {
    alias: {
      vue: 'vue/dist/vue.js'
    }
  },
  plugins: [
    new UglifyJsPlugin({
      sourceMap: false
    })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: [
            ['es2015', {
              modules: false,
              loose: true
            }]
          ]
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            js: 'babel-loader'
          }
        }
      }
    ]
  }
};