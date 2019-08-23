import request from 'wx/utils/request'
import api from 'wx/common/api/friendDivide'
import {format} from 'utils'
import qs from 'qs'
import Helper from "utils/helper"

export async function query(params) {
    return request(`${format(api.query.url)}?${qs.stringify(params)}`)
}

export async function update(payload) {
    return request(format(api.update.url, {group_id: payload.group_id}), {
        method: api.update.type,
        body: payload.body,
    })
}

export async function add(payload) {
    return request(format(api.add.url), {
        method: api.add.type,
        body: payload.body,
    })
}

export async function deleteDivide(payload) {
    return request(format(api.deleteDivide.url, {group_id: payload.group_id}), {
        method: api.deleteDivide.type,
    })
}
