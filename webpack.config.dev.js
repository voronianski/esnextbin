'use strict';

var webpack = require('webpack');
var path = require('path');
var cssnext = require('postcss-cssnext');
var postcssImport = require('postcss-import');

module.exports = {
    devtool: 'eval',

    entry: './src/app',

    output: {
        path: path.join(__dirname, 'build'),
        filename: 'app.js',
        publicPath: '/'
    },

    resolve: {
        extensions: ['', '.js', '.jsx', 'json']
    },

    module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loaders: ['babel?presets[]=react,presets[]=es2015,presets[]=stage-0']
        }, {
            test: /\.css$/,
            loaders: ['style', 'css', 'postcss']
        }]
    },

    postcss: function () {
        return [postcssImport, cssnext]
    },

    devServer: {
        port: 3993,
        historyApiFallback: {
            index: 'index-dev.html',
        }
    }
};
