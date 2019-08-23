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
            [`/api_${projectName}_first`]: {
                target: 'http://192.168.20.30',
                changeOrigin: true,
                "pathRewrite": {[`^/api_${projectName}_first`]: ""},
            },
            [`/api_${projectName}_blueprint`]: {
                target: 'http://192.168.10.158',
                changeOrigin: true,
                "pathRewrite": {[`^/api_${projectName}_blueprint`]: ""},
            },
            [`/api_${projectName}`]: {
                target: 'https://retail-develop.51zan.com',
                changeOrigin: true,
                "pathRewrite": {[`^/api_${projectName}`]: ""},
            },
        }
    },
}

