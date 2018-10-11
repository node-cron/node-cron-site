'use strict'
const path = require('path');

const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer;

let mode = process.env.NODE_ENV || 'development';

let plugins = [
  new VueLoaderPlugin(),
  new MiniCssExtractPlugin({
    filename: "[name].min.css",
    chunkFilename: "[id].css"
  }),
  new HtmlWebpackPlugin({ 
    template: './src/index.html', 
    filename: path.resolve(__dirname, 'dist/index.html'),
    minify: {
      collapseWhitespace: true
    },
    inject: false
  })
];

if(mode === 'production'){
  plugins.push(new PrerenderSPAPlugin({
    staticDir: `${__dirname}/dist`,
    routes: ['/', '/docs'],
    minify: {
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      decodeEntities: true,
      keepClosingSlash: true,
      sortAttributes: true
    },
    renderer: new Renderer({
      headless: true,
      renderAfterDocumentEvent: 'render-event',
      args: ['–no-sandbox', '–disable-setuid-sandbox']
    })
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
    port: 9000,
    historyApiFallback: true
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
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
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader"
        ]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      }
    ]
  },
  plugins: plugins,
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
}