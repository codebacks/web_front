import api from 'risk_control/common/api/byWxConfig'
import request from 'utils/request'
import {format} from 'utils'
import {stringify} from 'qs'

export async function query(params) {
    return request(`${api.query.url}?${stringify(params)}`)
}

export async function wxDivideOptions(params) {
    return request(`${api.wxDivideOptions.url}?${stringify(params)}`)
}

export async function getPermissionConfig() {
    return request(`${api.getPermissionConfig.url}`)
}

export async function setPermissionConfig(payload = {}) {
    return request(format(api.setPermissionConfig.url), {
        method: api.setPermissionConfig.type,
        body: payload.body,
    })
}

export async function getSinglePermission(payload) {
    return request(format(api.getSinglePermission.url, {uin: payload.uin}))
}

export async function setSinglePermission(payload = {}) {
    return request(format(api.setSinglePermission.url, {uin: payload.uin}), {
        method: api.setSinglePermission.type,
        body: payload.body,
    })
}




