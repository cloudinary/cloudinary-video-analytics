const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin()
    ]
  },
  entry: './src/index.js',
  output: {
    clean: true,
    filename: `[name].js`,
    path: path.resolve(__dirname, './dist'),
    library: {
      type: 'umd',
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader'
        }]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      ANALYTICS_VERSION: JSON.stringify(require('./package.json').version),
    }),
  ],
};
