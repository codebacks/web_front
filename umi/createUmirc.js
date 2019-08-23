/**
 **@Description:
 **@author: leo
 */
require('./beforeCreateUmirc.js')
const getUmiConfig = require('./getUmiConfig')
const getCSSModuleLocalIdent = require('./getCSSModuleLocalIdent')
const chainWebpack = require('./chainWebpack')
const development = process.env.NODE_ENV === 'development'
const {iconsPath, categoryIconsPath, fontIconsPath,  face, emoji} = require('./constant')
const {isDemandCompile} = require('./umi-plugin-HZ-demandCompile')

module.exports = function() {
    const {alias, proxy} = getUmiConfig()
    const dynamicImport = {
        level: 3,
        webpackChunkName: true,
        loadingComponent: './components/PageLoading/index',
    }

    const dvaOption = {
        hmr: true,
    }

    if(isDemandCompile) {
        dvaOption.dynamicImport = dynamicImport
    }

    return {
        define: {
            'HUZAN_ENV': process.env.HUZAN_ENV,
            'PREVIEW_ENV': process.env.PREVIEW_ENV,
            'DISABLE_BROWSER_DETECTION': process.env.DISABLE_BROWSER_DETECTION,
        },
        devtool: development ? 'cheap-module-eval-source-map' : 'none',
        minimizer: 'terserjs',
        treeShaking: true,
        plugins: [
            require('./umi-plugin-HZ-routes'),
            [
                'umi-plugin-react',
                {
                    antd: true,
                    fastClick: false,
                    pwa: false,
                    hd: false,
                    routes: false,
                    dva: dvaOption,
                    dynamicImport: !isDemandCompile && dynamicImport,
                    chunks: !development && [
                        'umi',
                        'vendors',
                        'runtimeChunk',
                        'styles',
                    ],
                    dll: {
                        exclude: [
                            '@babel/runtime',
                            'babel-plugin-lodash',
                            '@svgr/webpack',
                            'thread-loader',
                            'url-loader',
                            'react-hot-loader',
                            'cache-loader',
                            'cross-env',
                            'globby',
                            'hash-sum',
                            'sass-loader',
                            'node-sass',
                        ],
                        include: [
                            'dva',
                            'dva/router',
                            'dva/saga',
                            'dva/fetch',
                        ],
                    },
                    hardSource: false,
                },
            ],
            ['./umi/umi-plugin-HZ-raven'],
            ['./umi/umi-plugin-HZ-modifyWebpackConfig'],
            [
                './umi/umi-plugin-HZ-demandCompile',
                {
                    level: dynamicImport.level,
                },
            ],
        ],
        alias: {
            // ...{
            //     'lodash': 'lodash-es'
            // },
            ...alias,
        },
        proxy,
        lessLoaderOptions: {
            javascriptEnabled: true,
        },
        externals: {
            // '@antv/data-set': 'DataSet',
        },
        urlLoaderExcludes: [
            iconsPath,
            categoryIconsPath,
            fontIconsPath,
            face,
            emoji,
        ],
        hash: true,
        targets: {
            chrome: '43',
            firefox: '63',
        },
        theme: './src/theme.js',
        // publicPath: process.env.HUZAN_CDN,
        cssLoaderOptions: {
            modules: true,
            getLocalIdent: (context, localIdentName, localName) => {
                if(
                    context.resourcePath.includes('node_modules') ||
                    context.resourcePath.includes('ant.design.pro.less') ||
                    context.resourcePath.includes('global.less')
                ) {
                    return localName
                }

                return getCSSModuleLocalIdent(context, localIdentName, localName, {})
            },
        },
        // cssnano: {
        //     mergeRules: false,
        // },
        ignoreMomentLocale: true,
        chainWebpack,
        extraBabelPlugins: development ? [
            'react-hot-loader/babel',
        ] : [
            ['lodash'],
        ],
    }
}
