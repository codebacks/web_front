import request from 'crm/utils/request'
import Helper from 'crm/utils/helper'
import API from 'crm/common/api/order'
import qs from 'qs'

export async function query(params) {
    return request(`${Helper.format(API.LIST.url)}?${qs.stringify(params)}`)
}

export async function queryAll(params) {
    return request(`${Helper.format(API.LIST_ALL.url)}?${qs.stringify(params)}`)
}


export async function detail(params) {
    return request(`${Helper.format(API.DETAIL.url, {id: params.id})}?${qs.stringify(params)}`)
}

export async function queryImportStatus(params) {
    return request(`${Helper.format(API.IMPORT_STATUS.url, {id: params.id})}?${qs.stringify(params)}`)
}

export async function queryOrdersDetail(params) {
    return request(`${Helper.format(API.ORDER_DETAIL.url)}?${qs.stringify(params)}`)
}

export async function queryOrderSummary(params) {
    return request(`${Helper.format(API.ORDER_SUMMARY.url)}?${qs.stringify(params)}`)
}