import request from 'community/utils/request'
import api from 'community/common/api/groupDivide'
import {format} from 'utils'
import qs from 'qs'
import Helper from "utils/helper"

export async function query(params) {
    return request(`${format(api.query.url)}?${qs.stringify(params)}`)
}

export async function update(payload) {
    return request(format(api.update.url, {id: payload.id}), {
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
    return request(format(api.deleteDivide.url, {id: payload.id}), {
        method: api.deleteDivide.type,
    })
}
