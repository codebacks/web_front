import api from 'apps/common/api/apps'
import request from 'utils/request'
import {format} from 'utils'
import {stringify} from 'qs'

export async function apps(params) {
    return request(`${api.apps.url}?${stringify(params)}`)
}

export async function previewApps(params) {
    return request(`${api.previewApps.url}?${stringify(params)}`)
}

export async function getGrantApps(params) {
    return request(`${api.getGrantApps.url}?${stringify(params)}`)
}

export async function grantApps(params = {}) {
    return request(format(api.grantApps.url, {id: params.id}), {
        method: api.grantApps.type,
        body: params.body,
    })
}

export async function grantApp(params = {}) {
    return request(format(api.grantApp.url, {id: params.id}), {
        method: api.grantApp.type,
        body: params.body,
    })
}
