/**
 * 文件说明: 线上环境配置文件
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 18/08/01
 */

export default {
    apiHost: PREVIEW_ENV ? '/api_demo' : 'https://dev-wx.51zan.com',
}