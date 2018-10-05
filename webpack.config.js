'use strict'
const path = require('path');

const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer;

let mode = process.env.NODE_ENV || 'development';

let plugins = [
  new VueLoaderPlugin(),
  new HtmlWebpackPlugin({ template: './src/index.html', inject: false })
];

if(mode === 'production'){
  plugins.push(new PrerenderSPAPlugin({
    staticDir: `${__dirname}/dist`,
    routes: ['/', '/docs'],
    renderer: new Renderer()
  }));
}


module.exports = {
  mode: mode,
  entry: {
    app: "./src/main.js"
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: "umd",
    filename: "[name].min.js"
  },
  devtool: 'source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['*', '.js', '.vue', '.json']
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
          context: 'src'
        }
      },
      {
        test: /\.scss$/,
        use: [
            "style-loader",
            "css-loader",
            "sass-loader"
        ]
      },
      {
        test: /\.css$/,
        use: [
            "style-loader",
            "css-loader",
        ]
      }
    ]
  },
  plugins: plugins
}