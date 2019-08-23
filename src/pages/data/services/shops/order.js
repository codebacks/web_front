import request from 'data/utils/request'
import Helper from 'data/utils/helper'
import API from 'data/common/api/order'
import qs from 'qs'

export async function query(params) {
    return request(`${Helper.format(API.list.url)}?${qs.stringify(params)}`)
}

export async function queryAll(params) {
    return request(`${Helper.format(API.LIST_ALL.url)}?${qs.stringify(params)}`)
}


export async function detail(params) {
    return request(`${Helper.format(API.detail.url, {id: params.id})}?${qs.stringify(params)}`)
}

export async function queryImportStatus(params) {
    return request(`${Helper.format(API.IMPORT_STATUS.url, {id: params.id})}?${qs.stringify(params)}`)
}

