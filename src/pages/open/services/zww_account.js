import qs from 'qs'
import request from '../utils/request'
import API from 'platform/common/api/zww_account'



export async function getAccountList(params) {
    return request(API.getAccountList.url + `?${qs.stringify(params)}`)
}

export async function payment(params) {
    return request(API.payment.url, {
        method: API.payment.type,
        body: params
    })
}
export async function sendGameCurrencyList(params) {
    return request(API.sendGameCurrencyList.url + `?${qs.stringify(params)}`)
}

export async function settleRcordList(params) {
    return request(API.settleRcordList.url + `?${qs.stringify(params)}`)
}
