'use strict';

var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var cssnext = require('postcss-cssnext');
var postcssImport = require('postcss-import');

module.exports = {
    entry: {
        app: './src/app',
        embed: './src/embed'
    },

    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].min.js',
        publicPath: '/build'
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false },
            output: { comments: false }
        }),
        new ExtractTextPlugin('[name].min.css')
    ],

    resolve: {
        extensions: ['', '.js', '.jsx', 'json']
    },

    module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel'
        }, {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract('style-loader', 'css!postcss')
        }]
    },

    postcss: function () {
        return [postcssImport, cssnext]
    }
};
