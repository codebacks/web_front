const path = require('path')

module.exports = {
    alias({projectName, cwd, absPagesPath}) {
        return {
            [`${projectName}`]: path.join(`${absPagesPath}/${projectName}`, '/'),
        }
    },
    proxy({projectName, cwd, absPagesPath}) {
        return {
            [`/yiqixuan_${projectName}_init`]: {
                target: 'https://retail-develop.51zan.com',
                changeOrigin: true,
                "pathRewrite": {[`^/yiqixuan_${projectName}_init`]: ""},
            },
            [`/yiqixuan_${projectName}`]: {
                target: 'https://retail-mall-develop.51zan.com',
                changeOrigin: true,
                "pathRewrite": {[`^/yiqixuan_${projectName}`]: ""},
            },
        }
    },
}