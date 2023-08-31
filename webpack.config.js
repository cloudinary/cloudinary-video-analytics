const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

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
  }
};
