//封装的请求方法
import request from 'setting/utils/request'
//请求地址
import api from 'setting/common/api/orders'
import {stringify} from 'qs'

//获取订单列表
export async function getOrderList(params) {
    return request(`${api.getOrderList.url}?${stringify(params)}`)
}

//添加订单导入记录
export async function saveOrder(params) {
    return request(`${api.saveOrder.url}`, {
        method: api.saveOrder.type,
        body: params,
    })
}

export async function saveMemo(params) {
    return request(`${api.saveMemo.url}/${params.id}`, {
        method: api.saveMemo.type,
        body: params,
    })
}

export async function getFailItem(params) {
    return request(`${api.getFailItem.url}/${params.id}/failed_history?${stringify(params)}`)
}

export async function getShopOrderList(params) {
    return request(`${api.getShopOrderList.url}`)
}