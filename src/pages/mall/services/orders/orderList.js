import request from 'mall/utils/request'
import api from 'mall/common/api/orders/orderList'
import { stringify } from 'qs'

export async function getOrderList(params) {
    return request(`${api.getOrderList.url}?${stringify(params)}`,null,{returnResponse: true})
}

export async function orderDetail(params) {
    return request(`${api.getOrderList.url}/${params.id}`)
}

export async function getOrderSetting(params) {
    return request(`${api.getOrderSetting.url}`)
}

export async function resetOrderSetting(params) {
    return request(`${api.resetOrderSetting.url}`,{method: api.resetOrderSetting.type, body: params},{returnResponse: true})
}

export async function editTotalPrice(params) {
    return request(`${api.editTotalPrice.url}/${params.id}/price`,{method: api.editTotalPrice.type, body: params},{returnResponse: true})
}

export async function getExpress() {
    return request(`${api.getExpress.url}`)
}

export async function editExpress(params) {
    return request(`${api.editTotalPrice.url}/${params.id}/express`,{method: api.editTotalPrice.type, body: params},{returnResponse: true})
}

export async function orderExport(params) {
    return request(`${api.orderExport.url}?${stringify(params)}`)
}