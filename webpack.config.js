'use strict';

var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var cssnext = require('postcss-cssnext');
var postcssImport = require('postcss-import');

module.exports = {
    entry: './src/app',

    output: {
        path: path.join(__dirname, 'build'),
        filename: 'app.min.js',
        publicPath: '/build'
    },

    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            // compress: { warnings: false },
            // output: { comments: false }
        }),
        new ExtractTextPlugin('app.min.css')
    ],

    resolve: {
        extensions: ['', '.js', '.jsx', 'json']
    },

    module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel',
            query: {
                presets: ['react', 'es2015', 'stage-0']
            }
        }, {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract('style-loader', 'css!postcss')
        }],
        postLoaders: [{
            loader: 'transform?envify'
        }]
    },

    postcss: function () {
        return [postcssImport, cssnext]
    }
};
