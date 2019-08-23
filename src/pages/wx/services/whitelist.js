import request from 'wx/utils/request'
import qs from 'qs'
import Helper from 'wx/utils/helper'
import API from 'wx/common/api/whitelist'

export async function whitelistList(params) {
	return request(`${API.whitelistList.url}?${qs.stringify(params)}`)
}

export async function whitelistEditRemark(payload) {
	return request(`${Helper.format(API.whitelistEditRemark.url, {id: payload.id})}`, {
		method: API.whitelistEditRemark.type,
		body: payload.body
	})
}

export async function whitelistRemove(payload) {
	return request(`${Helper.format(API.whitelistRemove.url, {id: payload.id})}`, {
		method: API.whitelistRemove.type,
	})
}

export async function whitelistSearchWx(params) {
	return request(`${API.whitelistSearchWx.url}?${qs.stringify(params)}`)
}

export async function whitelistAdd(payload) {
	return request(`${API.whitelistAdd.url}`, {
		method: API.whitelistAdd.type,
		body: payload.body
	})
}

export async function blacklistList(params) {
    return request(`${API.blacklistList.url}?${qs.stringify(params)}`)
}

export async function blacklistRemove(payload) {
    return request(`${Helper.format(API.blacklistRemove.url, {id: payload.id})}`, {
        method: API.blacklistRemove.type,
    })
}

export async function addBlackList(payload) {
    return request(`${Helper.format(API.addBlackList.url)}`, {
        method: API.addBlackList.type,
        body: payload.body,
    })
}



