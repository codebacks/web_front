import request from 'wx/utils/request'
import Helper from 'wx/utils/helper'
import API from 'wx/common/api/material/library'
import qs from 'qs'

export async function list(payload) {
    const tagsParams = payload.tags ? `&${qs.stringify({tags: payload.tags}, {encode: false})}` : ''
    return request(`${API.list.url}?${qs.stringify(payload.params)}${tagsParams}`)
}

export async function create(payload) {
    return request(API.create.url, {
        method: API.create.type,
        body: payload.body
    })
}

export async function update(payload) {
    return request(`${Helper.format(API.update.url, {id: payload.id})}`, {
        method: API.update.type,
        body: payload.body
    })
}

export async function remove(payload) {
    return request(`${Helper.format(API.remove.url, {id: payload.id})}`, {
        method: API.remove.type,
    })
}

// 批量删除素材
export async function batchRemove(payload) {
    return request(`${API.batchRemove.url}?${qs.stringify(payload)}`, {
        method: API.batchRemove.type,
    })
}

// 创建文本素材
export async function createText(payload) {
    return request(API.createText.url, {
        method: API.createText.type,
        body: payload.body
    })
}

// 标签列表
export async function tags() {
    return request(API.tags.url)
}

// 批量打标
export async function batchTag(payload) {
    return request(API.batchTag.url, {
        method: API.batchTag.type,
        body: payload.body
    })
}

// 管理标签
export async function updateTags(payload) {
    return request(`${Helper.format(API.updateTags.url, {id: payload.id})}`, {
        method: API.updateTags.type,
        body: payload.body
    })
}

// 语音转换
export async function voiceConvert(payload) {
    return request(API.voiceConvert.url, {
        method: API.voiceConvert.type,
        body: payload.body
    })
}

// 分组
export async function groups() {
    return request(API.groups.url)
}

export async function createGroup(payload) {
    return request(API.createGroup.url, {
        method: API.createGroup.type,
        body: payload.body
    })
}

export async function updateGroup(payload) {
    return request(`${Helper.format(API.updateGroup.url, {id: payload.id})}`, {
        method: API.updateGroup.type,
        body: payload.body
    })
}

export async function removeGroup(payload) {
    return request(`${Helper.format(API.removeGroup.url, {id: payload.id})}`, {
        method: API.removeGroup.type,
    })
}
// 批量分组
export async function batchGroup(payload) {
    return request(API.batchGroup.url, {
        method: API.batchGroup.type,
        body: payload.body
    })
}





