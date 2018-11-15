const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',

  devtool: 'eval',

  target: 'web',

  entry: './src/index',

  output: {
    path: path.join(__dirname, './public/build'),
    filename: getFilename('js'),
    publicPath: '/public/build'
  },

  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        parallel: true,
        uglifyOptions: {
          compress: { warnings: false },
          output: { comments: false }
        }
      }),
      new OptimizeCssAssetsPlugin({})
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(env)
      }
    }),
    new MiniCssExtractPlugin({
      filename: getFilename('css')
    }),
    new CompressionPlugin({
      test: /\.js$/,
      threshold: 10240,
      minRatio: 0
    })
  ],

  resolve: {
    extensions: ['.js', '.jsx', 'json']
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      }
    ]
  }
};

function getFilename(ext) {
  return isProduction ? `bundle.min.${ext}` : `bundle.${ext}`;
}
