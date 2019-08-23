import qs from 'qs'
import request from 'wx/utils/request'
import API from 'wx/common/api/tags'
import Helper from "wx/utils/helper"

export async function search(params) {
    return request(API.search.url, {
        method: API.search.type,
        body: params
    })
}

export async function list(params) {
    return request(`${API.list.url}?${qs.stringify(params)}`)
}

export async function query(params) {
    return request(`${Helper.format(API.LIST.url)}?${qs.stringify(params)}`)
}

export async function create(params) {
    return request(API.CREATE.url, {
        method: API.CREATE.type,
        body: params,
    })
}

export async function modify(params) {
    return request(Helper.format(API.UPDATE.url, {id: params.id}), {
        method: API.UPDATE.type,
        body: params,
    })
}

export async function remove(params) {
    return request(Helper.format(API.DELETE.url, {id: params.id}), {
        method: API.DELETE.type,
        body: params,
    })
}

export async function stat(params) {
    return request(`${Helper.format(API.stat.url)}?${qs.stringify(params)}`)
}

export async function statExport(params) {
    return request(`${Helper.format(API.statExport.url)}?${qs.stringify(params)}`)
}
