import request from 'wx/utils/request'
import qs from 'qs'
import Helper from 'wx/utils/helper'
import API from 'wx/common/api/friends/duplication'

export async function list(params) {
    return request(`${API.list.url}?${qs.stringify(params)}`)
}

export async function friendsDetail(payload) {
    return request(Helper.format(API.friendsDetail.url, {username: payload.username}))
}

export async function addWhitelist(payload) {
    return request(API.addWhitelist.url, {
        method: API.addWhitelist.type,
        body: payload.body
    })
}

export async function tag(payload) {
    return request(Helper.format(API.tag.url, {uin: payload.uin, username: payload.username}), {
        method: API.tag.type
    })
}

export async function remove(payload) {
    return request(Helper.format(API.remove.url, {uin: payload.uin, username: payload.username, reason: payload.reason}), {
        method: API.remove.type
    })
}