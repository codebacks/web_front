import api from 'risk_control/common/api/byPermissionConfig'
import request from 'utils/request'
import {format} from 'utils'
import {stringify} from 'qs'

export async function getWxConigSummary() {
    return request(`${api.getWxConigSummary.url}`)
}

export async function query(payload, params) {
    return request(format(`${api.query.url}?${stringify(params)}`, {config_key: payload.configKey}))
}


export async function moveOut(payload = {}) {
    return request(format(api.moveOut.url, {config_key: payload.configKey}), {
        method: api.moveOut.type,
        body: payload.body,
    })
}

export async function addPermissionWechat(payload = {}) {
    return request(format(api.addPermissionWechat.url), {
        method: api.addPermissionWechat.type,
        body: payload.body,
    })
}




