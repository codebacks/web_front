import request from 'community/utils/request'
import api from 'community/common/api/autoReply/templateDetail'
import {format} from 'utils'
import qs from 'qs'

export async function query(payload) {
    return request(`${format(api.query.url, {template_id: payload.template_id})}`)
}

export async function addKeyword(payload) {
    return request(format(api.addKeyword.url, {template_id: payload.template_id}), {
        method: api.addKeyword.type,
        body: payload.body,
    })
}

export async function editKeyword(payload) {
    return request(format(api.editKeyword.url, {template_id: payload.template_id, keyword_id: payload.keyword_id}), {
        method: api.editKeyword.type,
        body: payload.body,
    })
}

export async function getReplyContents(payload) {
    return request(`${format(api.getReplyContents.url, {id: payload.id})}`)
}

export async function move(payload) {
    return request(format(api.move.url, {template_id: payload.template_id, keyword_id: payload.keyword_id}), {
        method: api.move.type,
        body: payload.body,
    })
}

export async function removeKeyword(payload) {
    return request(format(api.removeKeyword.url, {template_id: payload.template_id, keyword_id: payload.keyword_id}), {
        method: api.removeKeyword.type,
    })
}
