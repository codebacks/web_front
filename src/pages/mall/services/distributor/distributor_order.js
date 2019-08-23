import { stringify } from 'qs'
import request from 'mall/utils/request'
import api from '../../common/api/distributor/distributor_order'
import { format } from 'utils'
import _ from 'lodash'

function getdistribute(items, value) {
    const v = _.toInteger(value)
    const type = _.find(items, c => c.value === v)
    return type && type.text
}

// 订单状态
export const ORDER_STATUS = [{
    text: '待发货',
    value: 205
}, {
    text: '已发货',
    value: 400
}, {
    text: '已完成',
    value: 405
// }, {
//     text: '退货中',
//     value: 500
// }, {
//     text: '售后完成',
//     value: 505
}]

export function getOrderStatus(value) {
    return getdistribute(ORDER_STATUS, value)
}

export async function orderList(params) {
    return request(`${api.orderList.url}?${stringify(params)}`)
}

export async function orderDetail(params) {
    return request(format(api.orderDetail.url, { order_id: params.id }))
}