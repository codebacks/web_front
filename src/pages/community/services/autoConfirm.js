import request from 'community/utils/request'
import api from 'community/common/api/autoConfirm'
import {format} from 'utils'
import qs from 'qs'

export async function groupAutoPass(params) {
    return request(`${format(api.groupAutoPass.url)}?${qs.stringify(params)}`)
}

export async function updateGroupAutoPass(params) {
    return request(format(api.updateGroupAutoPass.url), {
        method: api.updateGroupAutoPass.type,
        body: params,
    })
}

export async function detail(params) {
    return request(`${format(api.detail.url)}?${qs.stringify(params)}`)
}

export async function update(params) {
    return request(format(api.update.url), {
        method: api.update.type,
        body: params,
    })
}

export async function wechatUpdate(params) {
    return request(format(api.wechatUpdate.url), {
        method: api.wechatUpdate.type,
        body: params,
    })
}