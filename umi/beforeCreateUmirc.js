/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/9/4
 */

const getYamlConfig = require('umi-build-dev/lib/routes/getYamlConfig.js')

if(getYamlConfig) {
    Object.keys(require.cache).forEach((item) => {
        const isGetYamConfig = item.indexOf('umi-build-dev') > -1 && item.indexOf('getYamlConfig') > -1
        if(isGetYamConfig) {
            const module = require.cache[item]
            if(module && module.exports) {
                module.exports.default = function _default() {
                    return {}
                }
            }
        }
    })
}
