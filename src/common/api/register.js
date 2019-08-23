/**
 **@Description:
 **@author: leo
 */

import config from 'config'

const api = {
    getCaptcha: {
        url: `${config.apiHost}/api/captcha`,
        type: 'GET',
    },
    mobileVerify: {
        url: `${config.apiHost}/api/register/mobile_verify`,
        type: 'POST',
    },
    register: {
        url: `${config.apiHost}/api/register`,
        type: 'POST',
    },
    inviteInfo: {
        url: `${config.apiHost}/api/register/invite_info`,
        type: 'GET',
    },
    // 注册商家时获取短信验证码
    registerSms: {
        url: `${config.apiHost}/api/sms/code`,
        type: 'POST',
    },
    // 注册商家
    registerCampany :{
        url: `${config.apiHost}/api/company/register`,
        type: 'POST',
    },
    // 企业QQ登录
    registerEnterprise :{
        url: `${config.apiRetailHost}/open/collaboration/qidian/user_auth`,
        type: 'POST',
    },
    // 企业QQ注册绑定
    registerEnterpriseBind :{
        url: `${config.apiRetailHost}/open/collaboration/qidian/user_bind`,
        type: 'POST',
    }

}


export default api
