/*
 * @Author: sunlzhi 
 * @Date: 2018-08-16 11:42:31 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-08-25 15:04:53
 */

import {stringify} from 'qs'
import request from 'setting/utils/request'
import api from 'setting/common/api/subscription'
import Helper from 'utils/helper'

export async function subData(params) {
    return request(`${api.subscription.url}`)
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

export async function qiniuToken(params) {
    return request(`${api.qiniuToken.url}?${stringify(params)}`)
}

export async function getSubLink(params) {
    return request(`${api.getSubLink.url}?${stringify(params)}`)
}

export async function subUnbind(params) {
    return request(Helper.format(api.subUnbind.url, {app_id: params.app_id}), {
        method: api.subUnbind.type,
    })
}

export async function putSubConfigure(params) {
    return request(Helper.format(api.putSubConfigure.url, {app_id: params.app_id}), {
        method: api.putSubConfigure.type,
        body: params,
    })
}

export async function subAuth(params) {
    return request(Helper.format(api.subAuth.url, {app_id: params.app_id}), {
        method: api.subAuth.type,
        body: params,
    })
}
