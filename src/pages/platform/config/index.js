/**
 **@Description:
 **@author: leo
 */

const config = require(`./${HUZAN_ENV}.js`).default

export default Object.assign({
    apiHost: '',
    apiHost_first: '/api_platform_first',
    apiHost_blueprint: '/api_setting_blueprint',
    // 晒图红包二维码前缀
    praiseRedPackageQrPrefix: ''
}, config)