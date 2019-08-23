const production = require('./production')
const development = require('./development')

module.exports = function chainWebpack(webpackConfig) {
    // webpackConfig.plugins.delete('friendly-errors').end()

    const {iconsPath, categoryIconsPath, fontIconsPath, face, emoji} = require('../constant')
    webpackConfig.module.rule('svg').test(/\.svg$/).include.add([iconsPath, categoryIconsPath, fontIconsPath]).end().use('@svgr/webpack').loader(require.resolve('@svgr/webpack')).options({
        icon: true,
    }).end()

    webpackConfig.module.rule('face').include.add([face, emoji]).end().use('url-loader').loader(require.resolve('url-loader')).options({
        limit: 1,
        name: 'static/[name].[hash:8].[ext]',
    })

    // webpackConfig.module.rule('js').use('thread-loader').loader(require.resolve('thread-loader')).before('babel-loader').end()

    webpackConfig.node.clear().merge({
        setImmediate: false,
        module: 'empty',
        dgram: 'empty',
        dns: 'mock',
        fs: 'empty',
        http2: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
    })

    development(webpackConfig)

    production(webpackConfig)
}
