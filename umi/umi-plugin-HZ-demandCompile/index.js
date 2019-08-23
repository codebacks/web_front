/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/2/1
 */

const development = process.env.NODE_ENV === 'development'
const demandCompile = !!process.env.DEMAND_COMPILE

const isDemandCompile = demandCompile && development

exports.isDemandCompile = isDemandCompile

if(isDemandCompile) {
    const routesToJSON = require('umi-build-dev/lib/routes/routesToJSON.js')

    if(routesToJSON) {
        Object.keys(require.cache).forEach((item) => {
            const isRoutesToJSON = item.indexOf('umi-build-dev') > -1 && item.indexOf('routesToJSON') > -1
            if(isRoutesToJSON) {
                const module = require.cache[item]
                if(module && module.exports) {
                    module.exports = require('./routesToJSON')
                }
            }
        })
    }
}

exports.default = (api, opts) => {
    if(!isDemandCompile) {
        return
    }

    const {setRequest, getRequest} = require('./requestCache')
    const {matchRoutes} = require('react-router-config')

    const {service} = api
    const {level} = opts

    if(level) {
        process.env.CODE_SPLITTING_LEVEL = level
    }

    api.modifyAFWebpackOpts(opts => {
        return {
            ...opts,
            disableDynamicImport: true,
        }
    })

    function getRequestedRoutes(requested, service) {
        return Object.keys(requested).reduce((memo, pathname) => {
            matchRoutes(service.routes, pathname).forEach(({route}) => {
                memo[route.path] = 1
            })
            return memo
        }, {})
    }

    api.modifyRouteComponent((memo, arg) => {
        const requested = getRequest() || {}
        const requestedMap = getRequestedRoutes(requested, service)
        const {path} = arg
        let ret = memo

        if(!requestedMap[path]) {
            let newPath = null
            const {config} = service
            const {winPath} = require('umi-utils')
            const cwd = process.cwd()
            const {join} = require('path')
            const compilingPath = winPath(join(cwd, './umi/umi-plugin-HZ-demandCompile/Compiling/index.js'))

            if(config.exportStatic && config.exportStatic.htmlSuffix) {
                newPath = path.replace('(.html)?', '')
            }
            ret = `() => React.createElement(require('${compilingPath}').default, { route: '${newPath || path}' })`
            arg.webpackChunkName = false
        }

        return ret

    })
    api.addMiddlewareAhead(() => {
        const {config} = service
        return (req, res, next) => {
            const {path} = req

            const COMPILING_PREFIX = '/__HZ_umi_dev/compiling'

            if(!path.startsWith(COMPILING_PREFIX)) {
                return next()
            }

            const routePath = path.replace(COMPILING_PREFIX, '')
            const matchedRoutes = matchRoutes(service.routes, routePath)

            if(matchedRoutes && matchedRoutes.length) {
                matchedRoutes.forEach(({route}) => {
                    let newPath = null
                    if(config.exportStatic && config.exportStatic.htmlSuffix) {
                        newPath = route.path.replace('(.html)?', '')
                    }
                    if(route.path) setRequest(newPath || route.path)
                })
                service.rebuildTmpFiles()
            }

            res.end('done')
        }
    })
}
