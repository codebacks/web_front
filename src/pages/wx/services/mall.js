import qs from 'qs'
import request from 'wx/utils/request'
import API from 'wx/common/api/mall'

export async function getProcedure() {
    return request(API.procedure.url)
}

export async function goods(params) {
    return request(`${API.goods.url}?${qs.stringify(params)}`)
}

export async function getMerchant() {
    return request(API.merchant.url)
}

export async function getMPACode(params) {
    return request(`${API.mpaCode.url}?${qs.stringify(params)}`, null, {
        returnResponse: true
    })
}



