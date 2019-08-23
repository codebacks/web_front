/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/9/4
 */

const development = process.env.NODE_ENV === 'development'

module.exports = function chainWebpack(webpackConfig) {
    if (development) {
        const _ = require('lodash')
        const {genCacheConfig} = require('../utils')
        const cacheLoaderOption = genCacheConfig(
            'cache-babel-loader',
            {
                '@babel/core': require('@babel/core/package.json').version,
                'babel-preset-umi': require('babel-preset-umi/package.json').version,
            },
            webpackConfig,
        )

        webpackConfig.module.rule('js').use('cache-loader').loader(require.resolve('cache-loader')).before('babel-loader').options(cacheLoaderOption).end()

        const cacheCssLoaderOption = genCacheConfig(
            'cache-css-loader',
            {
                'mini-css-extract-plugin': require('mini-css-extract-plugin').version,
                'css-loader': require('css-loader/package.json').version,
                'postcss-loader': require('postcss-loader/package.json').version,
            },
            webpackConfig,
        )

        webpackConfig.module.rule('css').use('cache-loader').loader(require.resolve('cache-loader')).before('css-loader').options(cacheCssLoaderOption).end()

        const cacheLessLoaderOption = genCacheConfig(
            'cache-less-loader',
            {
                'mini-css-extract-plugin': require('mini-css-extract-plugin').version,
                'css-loader': require('css-loader/package.json').version,
                'less-loader': require('less-loader/package.json').version,
                'postcss-loader': require('postcss-loader/package.json').version,
            },
            webpackConfig,
        )

        webpackConfig.module.rule('less').use('cache-loader').loader(require.resolve('cache-loader')).before('css-loader').options(cacheLessLoaderOption).end()

        const cacheSassLoaderOption = genCacheConfig(
            'cache-sass-loader',
            {
                'mini-css-extract-plugin': require('mini-css-extract-plugin').version,
                'css-loader': require('css-loader/package.json').version,
                'sass-loader': require('sass-loader/package.json').version,
                'node-sass': require('node-sass/package.json').version,
                'postcss-loader': require('postcss-loader/package.json').version,
            },
            webpackConfig,
        )

        webpackConfig.module.rule('sass').use('cache-loader').loader(require.resolve('cache-loader')).before('css-loader').options(cacheSassLoaderOption).end()

        webpackConfig.module.rule('js').use('babel-loader').tap((options) => {
            return _.merge(options, {
                cacheCompression: false,
            })
        }).end()

        webpackConfig.module.rule('js').use('thread-loader').loader(require.resolve('thread-loader')).before('babel-loader').options({
            poolTimeout: Infinity,
        }).end()
    }
}
