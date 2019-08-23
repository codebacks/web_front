import request from 'utils/request'
import api from 'common/api/sms'
import qs from 'qs'


export async function sentSms(params) {
    return request(api.sentSms.url, {
        method: api.sentSms.type,
        body: params,
    })
}

export async function captcha(params) {
    return request(`${api.captcha.url}?${qs.stringify(params)}`)
}

