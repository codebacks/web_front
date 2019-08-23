import request from 'utils/request'
import api from 'common/api/register'
import {stringify} from 'qs'
// import {format} from 'utils'

export async function mobileVerify(params, option) {
    return request(api.mobileVerify.url, {
        method: api.mobileVerify.type,
        body: params,
    }, option)
}

export async function register(params) {
    return request(api.register.url, {
        method: api.register.type,
        body: params,
    })
}

export async function inviteInfo(params) {
    return request(`${api.inviteInfo.url}?${stringify(params)}`)
}

// 注册商家时获取短信验证码
export async function registerSmsCode(params) {
    return request(api.registerSms.url, {
        method: api.registerSms.type,
        body: params,
    })
}
// 注册商家
export async function registerCampany(params) {
    return request(api.registerCampany.url, {
        method: api.registerCampany.type,
        body: params,
    })
}
export async function registerEnterprise(params) {
    return request(api.registerEnterprise.url, {
        method: api.registerEnterprise.type,
        body: params,
    })
}
export async function registerEnterpriseBind(params) {
    return request(api.registerEnterpriseBind.url, {
        method: api.registerEnterpriseBind.type,
        body: params,
    })
}
export async function getCaptcha(params) {
    return request(api.getCaptcha.url)
}
