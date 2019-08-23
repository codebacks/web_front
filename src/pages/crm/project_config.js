const path = require('path')

module.exports = {
    routes(routes, {projectName, cwd, absPagesPath}) {
        return [
            ...routes,
        ]
    },
    alias({projectName, cwd, absPagesPath}) {
        return {
            [`${projectName}`]: path.join(`${absPagesPath}/${projectName}`, '/'),
        }
    },
    proxy({projectName, cwd, absPagesPath}) {
        return {
            [`/deliver_${projectName}`]: {
                target: 'https://retail-mall-develop.51zan.com',
                changeOrigin: true,
                "pathRewrite": {[`^/deliver_${projectName}`]: ""},
            },
            [`/api_${projectName}_wu`]: {
                target: 'https://retail-develop.51zan.com',
                changeOrigin: true,
                "pathRewrite": {[`^/api_${projectName}_wu`]: ""},
            },
            [`/api_${projectName}`]: {
                target: 'https://dev-wx.51zan.com',
                changeOrigin: true,
                "pathRewrite": {[`^/api_${projectName}`]: ""},
            },
        }
    },
}