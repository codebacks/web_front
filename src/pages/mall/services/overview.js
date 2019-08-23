//封装的请求方法
import request from 'mall/utils/request'
//请求地址
import api from 'mall/common/api/overview'
import {stringify} from 'qs'



export async function getMerchantInfo(params) {
    return request(`${api.getMerchantInfo.url}`)
}

export async function getTradeInfo(params) {
    return request(`${api.getTradeInfo.url}`)
}

export async function getQRCode(params) {
    return request(`${api.getQRCode.url}`)
}

export async function getStartEnd(params) {
    return request(`${api.getStartEnd.url}`)
}

export async function getEchartsData(params) {
    return request(`${api.getEchartsData.url}?${stringify(params)}`)
}

export async function getMapStatus(params) {
    return request(`${api.getMapStatus.url}?${stringify(params)}`)
}
