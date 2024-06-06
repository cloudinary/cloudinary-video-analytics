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
  entry: './src/index.ts',
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
        test: /\.([cm]?ts|tsx)$/,
        loader: 'ts-loader'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      ANALYTICS_VERSION: JSON.stringify(require('./package.json').version),
    }),
  ],
};
