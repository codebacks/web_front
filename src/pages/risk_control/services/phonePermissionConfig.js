import api from 'risk_control/common/api/phonePermissionConfig'
import request from 'utils/request'
import {format} from 'utils'
import {stringify} from 'qs'

export async function getPhoneConfigSummary() {
    return request(`${api.getPhoneConfigSummary.url}`)
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

export async function addPermissionDevice(payload = {}) {
    return request(format(api.addPermissionDevice.url), {
        method: api.addPermissionDevice.type,
        body: payload.body,
    })
}



