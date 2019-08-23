import request from 'utils/request'
import Helper from 'utils/helper'
import API from 'wx/common/api/replies'
import qs from 'qs'

export async function query(params) {
    return request(`${Helper.format(API.LIST.url)}?${qs.stringify(params)}`)
}

export async function create(params) {
    return request(API.CREATE.url, {
        method: API.CREATE.type,
        body: params
    })
}

export async function modify(record) {
    return request(Helper.format(API.UPDATE.url, {id: record.id}), {
        method: API.UPDATE.type,
        body: record
    })
}

export async function remove(params) {
    return request(Helper.format(API.DELETE.url, {id: params.id}), {
        method: API.DELETE.type,
        body: params,
    })
}

export async function setTop(params) {
	return request(Helper.format(API.SET_TOP.url, {id: params.id}), {
		method: API.SET_TOP.type,
		body: params,
	})
}


export async function swap(params) {
	return request(Helper.format(API.SWAP.url), {
		method: API.SWAP.type,
		body: params,
	})
}