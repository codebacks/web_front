/**
 * 文件说明: 系统配置
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 18/08/01
 */

const config = require(`./${HUZAN_ENV}.js`).default

export default Object.assign({
    apiHost: '',
}, config)