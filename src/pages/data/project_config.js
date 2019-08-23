const path = require('path')

module.exports = {
    alias({projectName, cwd, absPagesPath}) {
        return {
            [`${projectName}`]: path.join(`${absPagesPath}/${projectName}`, '/'),
        }
    },
    proxy({projectName, cwd, absPagesPath}) {
        return {
            // [`/api_${projectName}_sh`]: {
            //     target: 'https://retail-develop.51zan.com',
            //     changeOrigin: true,
            //     "pathRewrite": {[`^/api_${projectName}_sh`]: ""},
            // },
            [`/api_${projectName}_wu`]: {
                target: 'https://retail-develop.51zan.com',
                changeOrigin: true,
                "pathRewrite": {[`^/api_${projectName}_wu`]: ""},
            },
            [`/api_${projectName}_sh`]: {
                target: 'https://retail-develop.51zan.com',
                changeOrigin: true,
                "pathRewrite": {[`^/api_${projectName}_sh`]: ""},
            },
            [`/api_${projectName}`]: {
                target: 'https://dev-wx.51zan.com',
                changeOrigin: true,
                "pathRewrite": {[`^/api_${projectName}`]: ""},
            }
        }
    },
}