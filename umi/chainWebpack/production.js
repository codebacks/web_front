/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/9/4
 */


const production = process.env.NODE_ENV === 'production'

module.exports = function chainWebpack(webpackConfig) {
    if(production) {
        const _ = require('lodash')
        const os = require('os')

        console.log(`cpu-length: ${os.cpus().length}`)

        // webpackConfig.output.set('filename', '[name].[chunkhash:8].js').end()
        // webpackConfig.output.set('chunkFilename', '[name].[chunkhash:8].chunk.js').end()
        // webpackConfig.output.set('sourceMapFilename', '[name].[chunkhash:8].js.map').end()
        webpackConfig.optimization.splitChunks({
            cacheGroups: {
                default: false,
                styles: {
                    name: 'styles',
                    test: /\.(css|less|scss)$/,
                    chunks: 'all',
                    priority: 0,
                    minChunks: 2,
                    enforce: true,
                },
                vendors: {
                    chunks: 'initial',
                    name: 'vendors',
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    enforce: true,
                },
                vendorsAsync: {
                    chunks: 'async',
                    name: true,
                    test: /[\\/]node_modules[\\/]/,
                    priority: -20,
                    minSize: 30000,
                    reuseExistingChunk: true,
                    enforce: true,
                },
                vendorsAsyncCommon: {
                    chunks: 'async',
                    name: true,
                    minChunks: 2,
                    priority: -30,
                    minSize: 30000,
                    reuseExistingChunk: true,
                    enforce: true,
                },
            },
        })

        webpackConfig.optimization.runtimeChunk({
            name: 'runtimeChunk',
        })

        // webpackConfig.optimization.splitChunks({
        //     chunks: 'async',
        //     minSize: 30000,
        //     maxSize: 0,
        //     minChunks: 1,
        //     maxAsyncRequests: 5,
        //     maxInitialRequests: 3,
        //     automaticNameDelimiter: '~',
        //     name: true,
        //     cacheGroups: {
        //         vendors: {
        //             name: 'vendors',
        //             test: /[\\/]node_modules[\\/]/,
        //             priority: -10,
        //         },
        //         default: {
        //             name: 'common',
        //             minChunks: 2,
        //             priority: -20,
        //             reuseExistingChunk: true,
        //         },
        //     },
        // }).runtimeChunk(false)

        webpackConfig.plugin('hash-module-ids').tap((options) => {
            return _.merge(options, [{
                hashDigest: 'hex',
            }])
        }).end()

        if(process.env.IS_USE_CDN) {
            const WebpackQiNiuPlugin = require('../../webpack/plugins/webpack-qiniu-plugin')
            const HUZAN_ENV = process.env.HUZAN_ENV

            webpackConfig.output.set('publicPath', `https://asset.51zan.com/retail/${HUZAN_ENV}/`)

            webpackConfig.plugin('cdn').use(WebpackQiNiuPlugin, [{
                // 七牛的accessKey
                accessKey: 'hxLChuZ00lgpuuN_Q5ogIj6-8ZehSQq7UbXLjd_Y',
                // 七牛的secretKey
                secretKey: '5taPdgGuk1X1Eg88VDiXf5JwDmrqU22IXkg5r40i',
                // 七牛的空间名称
                scope: 'asset',
                // 要上传的根目录
                rootDir: './dist',
                // 上传文件的目录
                stuffex: `retail/${HUZAN_ENV}/`,
                // 排除文件目录，只针对根目录下的一级目录
                exclude: [
                    'base',
                    'demo',
                    'images',
                ],
                // 排查上传的扩展名文件
                excludeExtensions: ['.html'],
            }])
        }

        if(process.env.USE_COMPRESSION) {
            webpackConfig.plugin('compression').use(require('compression-webpack-plugin'), [
                {
                    filename: '[path].gz[query]',
                    algorithm: 'gzip',
                    test: /\.js(\?.*)?$/i,
                    compressionOptions: {
                        threshold: 10240,
                        minRatio: 0.8,
                    },
                },
            ]).end()
        }

        // webpackConfig.plugin('lodash-webpack-plugin').use(require('lodash-webpack-plugin')).end()

        // webpackConfig.plugin('webpack-deep-scope-plugin').use(require('webpack-deep-scope-plugin').default).end()

        webpackConfig.plugin('named-chunks').use(require('webpack/lib/NamedChunksPlugin'), [chunk => {
            if(chunk.name) {
                return chunk.name
            }
            const hash = require('hash-sum')
            const joinedHash = hash(
                Array.from(chunk.modulesIterable, m => m.id).join('_'),
            )
            return `chunk-` + joinedHash
        }]).end()

        webpackConfig.module.rule('js').use('thread-loader').loader(require.resolve('thread-loader')).before('babel-loader').end()
    }
}
