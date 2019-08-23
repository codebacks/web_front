/**
 **@Description:
 **@author: leo
 */

import request from 'setting/utils/request'
import api from 'setting/common/api/departments'
import {format} from 'utils'

export async function tree() {
    return request(`${api.tree.url}`)
}

export async function create(params) {
    return request(api.create.url, {
        method: api.create.type,
        body: params,
    })
}

export async function move(params) {
    return request(api.move.url, {
        method: api.move.type,
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

