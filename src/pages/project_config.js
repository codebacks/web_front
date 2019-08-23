const path = require('path')

module.exports = {
    // routes(routes, {projectName, cwd, absPagesPath}) {
    //     return routes
    // },
    alias({projectName, cwd, absPagesPath}) {
        return {
            utils: path.join(cwd, `src/utils/`),
            assets: path.join(cwd, 'src/assets/'),
            components: path.join(cwd, 'src/components/'),
            common: path.join(cwd, 'src/common/'),
            services: path.join(cwd, 'src/services/'),
            tools: path.join(cwd, 'src/tools/'),
            hoc: path.join(cwd, 'src/hoc/'),
            config: path.join(cwd, 'src/config/'),
            style: path.join(cwd, 'src/style/'),
            business: path.join(cwd, 'src/components/business/'),
            layouts: path.join(cwd, 'src/layouts/'),
            hooks: path.join(cwd, 'src/hooks/'),
        }
    },
    proxy({projectName, cwd, absPagesPath}) {
        return {
            [`/api_${projectName}_open`]: {
                target: 'https://dev-open-api.51zan.com',
                changeOrigin: true,
                pathRewrite: {[`^/api_${projectName}_open`]: ''},
            },
            [`/api_${projectName}_retail`]: {
                target: 'https://retail-develop.51zan.com',
                changeOrigin: true,
                "pathRewrite": {[`^/api_${projectName}_retail`]: ""},
            },
            [`/api_${projectName}`]: {
                target: 'https://dev-wx.51zan.com',
                changeOrigin: true,
                "pathRewrite": {[`^/api_${projectName}`]: ""},
            },
        }
    },
}
