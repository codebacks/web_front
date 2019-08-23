import request from 'wx/utils/request'
import api from 'wx/common/api/autoGroupGreet'
import {format} from 'utils'
import qs from 'qs'

export async function getConfig(params) {
    return request(`${format(api.getConfig.url)}?${qs.stringify(params)}`)
}

export async function setConfig(params) {
    return request(format(api.setConfig.url), {
        method: api.setConfig.type,
        body: params,
    })
}

export async function createContent(params) {
    return request(format(api.createContent.url), {
        method: api.createContent.type,
        body: params,
    })
}

export async function deleteContent(params) {
    return request(format(api.deleteContent.url, {id: params.id}), {
        method: api.deleteContent.type,
        body: params,
    })
}

export async function updateContent(params) {
    return request(format(api.updateContent.url, {id: params.id}), {
        method: api.updateContent.type,
        body: params,
    })
}

export async function move(params) {
    return request(format(api.move.url, {id: params.id}), {
        method: api.move.type,
        body: params,
    })
}

export async function getOneConfig(params) {
    return request(`${format(api.getOneConfig.url, {
        uin: params.uin,
        group_username: params.group_username,
    })}?${qs.stringify(params)}`)
}

export async function setOneConfig(params) {
    return request(format(api.setOneConfig.url, {uin: params.uin, group_username: params.group_username}), {
        method: api.setOneConfig.type,
        body: params,
    })
}

export async function createOneContent(params) {
    return request(format(api.createOneContent.url, {uin: params.uin, group_username: params.group_username}), {
        method: api.createOneContent.type,
        body: params,
    })
}

export async function deleteOneContent(params) {
    return request(format(api.deleteOneContent.url, {
        id: params.id,
        uin: params.uin,
        group_username: params.group_username,
    }), {
        method: api.deleteOneContent.type,
        body: params,
    })
}

export async function updateOneContent(params) {
    return request(format(api.updateOneContent.url, {
        id: params.id,
        uin: params.uin,
        group_username: params.group_username,
    }), {
        method: api.updateOneContent.type,
        body: params,
    })
}

export async function oneMove(params) {
    return request(format(api.oneMove.url, {id: params.id, uin: params.uin, group_username: params.group_username}), {
        method: api.oneMove.type,
        body: params,
    })
}