const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const productionWebpackConfig = require('./webpack.config');

module.exports = {
  ...productionWebpackConfig,
  entry: './dev/main.js',
  resolve: {
    alias: {
      'cloudinary-video-analytics': path.resolve(__dirname, 'src/index.js'),
    },
  },
  mode: 'development',
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, './dev/index.html')
    })
  ],
  devServer: {
    host: 'localhost',
    port: 3000,
    open: ['index.html'],
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*'
    }
  }
};
