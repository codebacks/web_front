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
    alias({ projectName, cwd, absPagesPath }) {
        return {
            [`${projectName}`]: path.join(`${absPagesPath}/${projectName}`, '/'),
        }
    },
    proxy({ projectName, cwd, absPagesPath }) {
        return {
            [`/api_${projectName}`]: {
                target: 'https://dev-wx.51zan.com',
                changeOrigin: true,
                "pathRewrite": {[`^/api_${projectName}`]: ""},
            },
        }
    },
}