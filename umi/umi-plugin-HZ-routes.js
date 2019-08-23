/**
 **@Description:
 **@author: leo
 */

const pageSuffixRe = /._page(\$)?$/
const passRouteArr = ['_layout', '404']
const passPageConfigRe = /^page$/
const globalPagePath = '/page'
const removePageSuffixRe = /_page/
const removeIndexPageNameRe = /\/index$/
const globalLayoutFile = `layouts/index.js`
const routeNameRe = /ignore_routes\//g
const routeNameEndPath = '/ignore_routes'
const {getProjectConfigConfigs, getBaseConfig, routesForeach, getPathBase} = require('./utils')

const pageConfigs = getProjectConfigConfigs(true)
const baseConfig = getBaseConfig(true)

module.exports = [
    'umi-plugin-routes',
    {
        exclude: route => {
            if(!route.path && route.component) {
                return true
            }

            if(route.path) {
                if(route.component.endsWith(globalLayoutFile)) {
                    return false
                }
                const {baseName, extName} = getPathBase(route.component)

                if(pageSuffixRe.test(baseName)) {
                    return false
                }

                if(passRouteArr.includes(baseName)) {
                    return false
                }

                if(globalPagePath !== route.path && passPageConfigRe.test(baseName)) {
                    if(route.path.endsWith(routeNameEndPath)) {
                        throw new Error(`${route.component} not create page${extName} by page name`)
                    }

                    return false
                }

                return true
            }
            return false
        },
        update(routes) {
            routesForeach(routes, route => {
                if(route.path) {
                    route.path = route.path.replace(removePageSuffixRe, '')
                    route.path = route.path.replace(removeIndexPageNameRe, '/')
                    route.path = route.path.replace(routeNameRe, '')
                    if(route.path !== '/' && route.path.slice(-1) === '/') {
                        route.path = route.path.slice(0, -1)
                    }
                }
            })

            pageConfigs.forEach((pageConfig) => {
                if(typeof pageConfig.routes === 'function') {
                    routes = pageConfig.routes(routes, pageConfig)
                }
            })

            if(typeof baseConfig.routes === 'function') {
                routes = baseConfig.routes(routes, baseConfig)
            }

            return routes
        },
    },
]
