/**
 **@Description:
 **@author: leo
 */

import {stringify} from 'qs'
import request from 'setting/utils/request'
import api from 'setting/common/api/users'
import {format} from 'utils'

export async function query(params) {
    return request(`${api.list.url}?${stringify(params)}`)
}

export async function invitations(params) {
    return request(`${api.invitations.url}?${stringify(params)}`)
}

export async function invitationInit(params) {
    return request(`${api.invitationInit.url}?${stringify(params)}`)
}

export async function invitationVerify(params) {
    return request(format(api.invitationVerify.url, {id: params.id}), {
        method: api.invitationVerify.type,
        body: params,
    })
}

export async function detail(params) {
    return request(format(api.detail.url, {id: params.id}))
}

export async function create(params) {
    return request(api.create.url, {
        method: api.create.type,
        body: params,
    })
}

export async function update(params) {
    return request(format(api.update.url, {id: params.id}), {
        method: api.update.type,
        body: params,
    })
}

export async function remove(params) {
    return request(format(api.remove.url, {id: params.id}), {
        method: api.remove.type,
        body: params,
    })
}