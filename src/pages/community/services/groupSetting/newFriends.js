import request from 'community/utils/request'
import api from 'community/common/api/groupSetting/newFriends'
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

export async function getOneConfig(params) {
    return request(`${api.getOneConfig.url}?${qs.stringify(params)}`)
}

export async function setOneConfig(params) {
    return request(api.setOneConfig.url, {
        method: api.setOneConfig.type,
        body: params,
    })
}

export async function createOneContent(params) {
    return request(api.createOneContent.url, {
        method: api.createOneContent.type,
        body: params,
    })
}

export async function deleteOneContent(params) {
    return request(format(api.deleteOneContent.url, {
        row_id: params.row_id,
    }), {
        method: api.deleteOneContent.type,
        body: params,
    })
}

export async function updateOneContent(params) {
    return request(format(api.updateOneContent.url, {
        row_id: params.row_id,
    }), {
        method: api.updateOneContent.type,
        body: params,
    })
}

export async function oneMove(params) {
    return request(format(api.oneMove.url, {row_id: params.row_id}), {
        method: api.oneMove.type,
        body: params,
    })
}
