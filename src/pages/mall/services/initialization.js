/*
 * @Author: sunlzhi 
 * @Date: 2018-10-10 14:14:14 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-10-19 10:17:18
 */

import {stringify} from 'qs'
import request from 'mall/utils/request'
import api from 'mall/common/api/initialization'
import Helper from 'utils/helper'

export async function procedure(params) {
    return request(`${api.procedure.url}?${stringify(params)}`)
}

export async function getToken(params) {
    return request(`${api.getToken.url}?${stringify(params)}`)
}

export async function create(params) {
    return request(api.create.url, {
        method: api.create.type,
        body: params,
    })
}

export async function getWxMerchants(params) {
    return request(`${api.getWxMerchants.url}`)
}

export async function getMpas(params) {
    return request(`${api.mpas.url}`)
}

export async function addShop(params) {
    return request(Helper.format(api.addShop.url, params), {
        method: api.addShop.type,
        body: params,
    })
}

export async function updateShop(params) {
    return request(Helper.format(api.updateShop.url, params), {
        method: api.updateShop.type,
        body: params,
    })
}
