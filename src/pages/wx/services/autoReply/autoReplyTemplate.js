import request from 'wx/utils/request'
import api from 'wx/common/api/autoReply/autoReplyTemplate'
import {format} from 'utils'
import qs from 'qs'

export async function query(params) {
    return request(`${format(api.query.url)}?${qs.stringify(params)}`)
}

export async function add(payload) {
    return request(format(api.add.url), {
        method: api.add.type,
        body: payload.body,
    })
}


export async function edit(payload) {
    return request(format(api.edit.url, {template_id: payload.template_id}), {
        method: api.edit.type,
        body: payload.body,
    })
}

export async function remove(payload) {
    return request(format(api.remove.url, {template_id: payload.template_id}), {
        method: api.remove.type,
        body: payload.body,
    })
}

export async function removeCheck(payload) {
    return request(format(api.removeCheck.url, {template_id: payload.template_id}))
}


