/**
 **@Description:
 **@author: leo
 */

const {getProjectConfigConfigs, getBaseConfig} = require('./utils')

module.exports = function() {
    const projectConfigConfigs = getProjectConfigConfigs()
    const baseConfig = getBaseConfig()
    const alias = {}
    const proxy = {}
    projectConfigConfigs.forEach((projectConfigConfig) => {
        if(projectConfigConfig.alias) {
            Object.assign(alias, projectConfigConfig.alias)
        }
        if(projectConfigConfig.proxy) {
            Object.assign(proxy, projectConfigConfig.proxy)
        }
    })

    if(baseConfig.alias) {
        Object.assign(alias, baseConfig.alias)
    }

    if(baseConfig.proxy) {
        Object.assign(proxy, baseConfig.proxy)
    }

    return {
        alias,
        proxy,
    }
}