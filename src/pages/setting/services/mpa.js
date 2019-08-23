/*
 * @Author: sunlzhi 
 * @Date: 2018-08-24 17:59:33 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-08-25 14:13:33
 */

import {stringify} from 'qs'
import request from 'setting/utils/request'
import api from 'setting/common/api/mpa'
import Helper from 'utils/helper'

export async function getMpas(params) {
    return request(`${api.mpas.url}`)
}

export async function addSubConfigure(params) {
    return request(Helper.format(api.addSubConfigure.url, {app_id: params.app_id}))
}

export async function payConfigure(params) {
    return request(`${api.payConfigure.url}`)
}

export async function getSubAuthInfo(params) {
    return request(Helper.format(api.getSubAuthInfo.url, {app_id: params.app_id}))
}

export async function getSubLink(params) {
    return request(`${api.getSubLink.url}?${stringify(params)}`)
}

export async function mpaUnbind(params) {
    return request(Helper.format(api.mpaUnbind.url, {app_id: params.app_id}), {
        method: api.mpaUnbind.type,
    })
}

export async function putSubConfigure(params) {
    return request(Helper.format(api.putSubConfigure.url, {app_id: params.app_id}), {
        method: api.putSubConfigure.type,
        body: params,
    })
}

export async function mpaAuth(params) {
    return request(Helper.format(api.mpaAuth.url, {app_id: params.app_id}), {
        method: api.mpaAuth.type,
        body: params,
    })
}
