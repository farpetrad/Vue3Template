﻿const path = require('path');

const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackCleanPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');
const WebpackBundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

//Output location
const appOutputPath = './wwwroot/Scripts/Bundle';
const styleOutputPath = '../../Content/Styles';
const imgOutputPath = '../../Content';
const pageOutputPath = './wwwroot/';

//App lication in sln
const appbasePath = './ClientApp/';

//Paths
const scriptPath = './Scripts/Bundle/';
const stylePath = '/Content/Styles';

const environmentName = (process.env.NODE_ENV || '').trim();
const isProduction = environmentName === 'production';

module.exports = {
    context: path.resolve(__dirname, appbasePath),
    entry: {
        //vendor: ['vue', 'vuex','vue-router','axios'], // can control vendor bundle but can't use name function
        'main': "./main.js"
    },
    mode: environmentName,
    output: {
        path: path.resolve(__dirname, appOutputPath),
        publicPath: scriptPath,
        filename: `[name]${isProduction ? '.[chunkhash]' : ''}.js`,
        sourceMapFilename: '[file].map'
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                exclude: /node_modules/,
                loader: 'vue-loader'
                
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.*scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            indentedSyntax: false
                        }
                    }
                ]
            },
            {
                test: /\.*sass$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            indentedSyntax: true
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
                loader: 'file-loader'
            },
            //{
            //    test: /\.(png|jpe?g|gif|svg)(\?\S*)?$/,
            //    loader: 'file-loader',
            //    options: {
            //        name: '[name].[ext]?[hash]',
            //        outputPath: imgOutputPath + 'Images'
            //    }
            //},
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            fallback: 'file-loader',
                            name: '[name].[ext]?[hash]',
                            outputPath: imgOutputPath + '/Images'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new WebpackCleanPlugin(
            [
                appOutputPath + '/*.js',
                appOutputPath + '/*.map',
                appOutputPath + '/index.html',
                appOutputPath + styleOutputPath + '/*.css',
                appOutputPath + '/*.json'
            ]
        ),

        new webpack.HashedModuleIdsPlugin(),

        new AssetsPlugin({
            filename: 'webpack.assets.json',
            path: path.resolve(__dirname, appOutputPath),
            prettyPrint: true
        }),

        new VueLoaderPlugin(),

        new webpack.DefinePlugin({
            'process.env.NODE_ENV' : JSON.stringify(process.env.NODE_ENV)
        }),

        new HtmlWebpackPlugin({
            title: 'Vuetemplate',
            filename: path.resolve(__dirname, pageOutputPath + 'index.html'),
            inject: true,
            template: path.resolve(__dirname, appbasePath + '/public/index.html')
        }),

        new MiniCssExtractPlugin({
            filename: isProduction ? styleOutputPath + '[name].[hash].css' : styleOutputPath + '[name].css',
            chunkFilename: isProduction ? styleOutputPath + '[id].[hash].css' : styleOutputPath + '[id].css',
            publicPath: stylePath
        })

        //,new WebpackBundleAnalyzerPlugin()
    ],
    optimization: {
        moduleIds: 'hashed',
        chunkIds: 'named',
        runtimeChunk: {
            name: 'runtime'
        },
        splitChunks: {
            cacheGroups: {
                vendor: {
                    chunks: 'all',
                    test: /[\\/]node_modules[\\/]/,
                    enforce: true,
                    name(module) {
                        // get the name. E.g. node_modules/packageName/not/this/part.js
                        // or node_modules/packageName
                        const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

                        // npm package names are URL-safe, but some servers don't like @ symbols
                        return `npm.${packageName.replace('@', '')}`;
                    }
                }
            }
        }
    }
};

switch (process.env.NODE_ENV) {
    case 'production':
        module.exports.devtool = '';
        module.exports.optimization.minimize = true;

        module.exports.optimization.minimizer = (module.exports.optimization.minimizer || []).concat([
            new OptimizeCssPlugin()            
        ]);

        break;
    case 'development':
        module.exports.devtool = '#source-map';

        module.exports.plugins = (module.exports.plugins || []).concat([
            new webpack.SourceMapDevToolPlugin({
                moduleFilenameTemplate: path.relative(appOutputPath, '[resourcePath]')
            })
        ]);

        break;
}