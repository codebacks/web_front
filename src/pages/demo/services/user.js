import { stringify } from 'qs'
import request from 'demo/utils/request'
import API from '../common/api/user'
import Helper from 'utils/helper'

export async function get(id){
    return request(Helper.format(API.detail.url, {id}) )
}

export async function query(params, pageOptions) {
    var param = {
        ...params,
        limit: pageOptions.pageSize,
        offset: (pageOptions.pageIndex - 1) * pageOptions.pageSize
    }
    return request(`${API.list.url}?${stringify(param)}`)
}

export async function create(body) {
    return request(API.create.url, {
        method: API.create.type,
        body: body,
    })
}

export async function update(body) {
    return request(API.update.url, {
        method: API.update.type,
        body: body,
    })
}

export async function remove(body) {
    return request(Helper.format(API.remove.url, {id: body.id}), {
        method: API.remove.type,
        body: body,
    })
}