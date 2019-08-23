import {stringify} from 'qs'
import { callApi } from '../utils/callApi'
import api from '../common/api/importOrder'
import Helper from 'utils/helper'

import _ from 'lodash'

export const ORDER_STATUSES = [{
    name: '未付款',
    value: 1
},{
    name: '等待发货',
    value: 2
},{
    name: '部分发货',
    value: 3
},{
    name: '已发货',
    value: 4
},{
    name: '交付中',
    value: 5
},{
    name: '已完成',
    value: 6
},{
    name: '已关闭',
    value: 7
},{
    name: '已退款',
    value: 8
}]

export const ORDER_FORMS = [
    {
        name: '自动同步',
        value: 1
    },
    {
        name: '手动导入',
        value: 2
    },{
        name: '老系统迁移',
        value: 3
    },{
        name: 'API订单导入',
        value: 5
    }]


export async function getOrders(condition, pageOptions){
    return callApi(api.getOrderList, {
        body: {
            ...condition,
            limit: pageOptions.pageSize,
            offset: (pageOptions.pageIndex - 1) * pageOptions.pageSize
        }
    })
}

export async function getOrder(id){
    return callApi({
        url: Helper.format(api.get.url, {id})
    }, {
        isErrorPropagation: true
    })
}

export async function getOrderInfo(params){
    return callApi({
        url: Helper.format(api.getOrderInfo.url+'?'+ stringify(params))
    },{
        is404EqualEmpty: true
    })
}

export function getOrderStatusText(value){
    return getListItemText(ORDER_STATUSES, value)
}

export function getOrderFormText(value){
    return getListItemText(ORDER_FORMS, value)
}

function getListItemText(items, value){
    const v = _.toInteger(value)
    const type = _.find(items , c => c.value === v)
    return type && type.name
}


export async function exportOrder(params) {
    return new Promise((resolve, reject) => {
        callApi({
            url: Helper.format(api.exportOrder.url+'?'+ stringify(params))
        },{
            is404EqualEmpty: true,
            isErrorPropagation: true
        }).then((response) => {
            resolve(response)
        }, (error) => {
            resolve(error)
        })
    })
}


export async function importLogistics(params) {
    return callApi({
        url: Helper.format(api.importLogistics.url+'?'+ stringify(params))
    },{
        is404EqualEmpty: true
    })
}
