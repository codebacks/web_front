import {stringify} from 'qs'
import request from 'setting/utils/request'
import api from 'setting/common/api/service_log'
import Helper from 'utils/helper'

export async function getTableList(params) {
    return request(`${api.getTableList.url}?${stringify(params)}`)
}

export async function afterSale(params) {
    return request(api.afterSale.url, {
        method: api.afterSale.type,
        body: params,
    })
}