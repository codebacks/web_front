import request from 'wx/utils/request'
import api from 'wx/common/api/autoReply/autoReplyGlobal'
import {format} from 'utils'
import qs from 'qs'

export async function query(params) {
    return request(`${format(api.query.url)}?${qs.stringify(params)}`)
}

export async function setStatus(payload) {
    return request(format(api.setStatus.url), {
        method: api.setStatus.type,
        body: payload.body,
    })
}

export async function addKeyword(payload) {
    return request(format(api.addKeyword.url), {
        method: api.addKeyword.type,
        body: payload.body,
    })
}

export async function editKeyword(payload) {
    return request(format(api.editKeyword.url, {keyword_id: payload.keyword_id}), {
        method: api.editKeyword.type,
        body: payload.body,
    })
}

export async function getReplyContents(payload) {
    return request(`${format(api.getReplyContents.url, {id: payload.id})}`)
}

export async function move(payload) {
    return request(format(api.move.url, {keyword_id: payload.keyword_id}), {
        method: api.move.type,
        body: payload.body,
    })
}

export async function removeKeyword(payload) {
    return request(format(api.removeKeyword.url, {keyword_id: payload.keyword_id}), {
        method: api.removeKeyword.type,
    })
}
