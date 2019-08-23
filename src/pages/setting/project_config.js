const path = require('path')

module.exports = {
    // routes(routes, {projectName, cwd, absPagesPath}) {
    //     return [
    //         {
    //             'path': '/demo',
    //             'exact': true,
    //             'redirect': '/demo/index',
    //         },
    //         ...routes,
    //     ]
    // },
    alias({projectName, cwd, absPagesPath}) {
        return {
            [`${projectName}`]: path.join(`${absPagesPath}/${projectName}`, '/'),
        }
    },
    proxy({projectName, cwd, absPagesPath}) {
        return {
            [`/yiqixuan_${projectName}`]: {
                target: 'https://retail-mall-develop.51zan.com',
                changeOrigin: true,
                "pathRewrite": {[`^/yiqixuan_${projectName}`]: ""},
            },
            [`/api_${projectName}_pay`]: {
                target: 'http://192.168.10.95:81',
                changeOrigin: true,
                "pathRewrite": {[`^/api_${projectName}_pay`]: ""},
            },
            [`/api_${projectName}_wu`]: {
                target: 'https://retail-develop.51zan.com',
                changeOrigin: true,
                "pathRewrite": {[`^/api_${projectName}_wu`]: ""},
            },
            [`/api_${projectName}_dev`]: {
                target: 'https://retail-develop.51zan.com',
                changeOrigin: true,
                "pathRewrite": {[`^/api_${projectName}_dev`]: ""},
            },
            [`/api_${projectName}`]: {
                target: 'https://dev-wx.51zan.com',
                changeOrigin: true,
                "pathRewrite": {[`^/api_${projectName}`]: ""},
            },
        }
    },
}