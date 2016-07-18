'use strict';

var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var cssnext = require('postcss-cssnext');
var postcssImport = require('postcss-import');

module.exports = {
    devtool: 'eval',

    entry: {
        app: './src/app',
        embed: './src/embed'
    },

    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].js',
        publicPath: '/'
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('development')
            }
        }),
        new ExtractTextPlugin('[name].css')
    ],

    resolve: {
        modulesDirectories: [
            path.resolve(__dirname, 'node_modules'),
            'node_modules'
        ],
        extensions: ['', '.js', '.jsx', 'json'],
        alias: {
            'react': 'preact-compat',
            'react-dom': 'preact-compat',
            'react-ace': path.join(__dirname, 'node_modules', 'react-ace', 'src', 'ace.jsx')
        }
    },

    module: {
        loaders: [{
            test: /\.jsx?$/,
            include: [
                path.resolve(__dirname, 'src'),
                path.resolve(__dirname, 'node_modules/react-ace')
            ],
            loader: 'babel'
        }, {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract('style-loader', 'css!postcss')
        }]
    },

    postcss: function () {
        return [postcssImport, cssnext];
    }
};
