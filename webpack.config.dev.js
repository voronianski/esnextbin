'use strict';

var webpack = require('webpack');
var path = require('path');
var cssnext = require('postcss-cssnext');
var postcssImport = require('postcss-import');

module.exports = {
    devtool: 'eval',

    entry: [
        'webpack-dev-server/client?localhost:3993',
        'webpack/hot/only-dev-server',
        './src/app'
    ],

    output: {
        path: path.join(__dirname, 'build'),
        filename: 'app.js',
        publicPath: '/'
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],

    resolve: {
        extensions: ['', '.js', '.jsx', 'json']
    },

    module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loaders: ['react-hot', 'babel?presets[]=react,presets[]=es2015,presets[]=stage-0']
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
