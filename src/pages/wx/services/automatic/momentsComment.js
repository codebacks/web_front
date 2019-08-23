import request from 'wx/utils/request'
import Helper from 'wx/utils/helper'
import API from 'wx/common/api/automatic/momentsComment'
import qs from 'qs'

export async function addComment(payload) {
    return request(`${Helper.format(API.addComment.url, {id: payload.id})}`, {
        method: API.addComment.type,
        body: payload.body
    })
}

export async function tasks(payload) {
    return request(`${Helper.format(API.tasks.url, {id: payload.id})}?${qs.stringify(payload.params)}`)
}

export async function details(payload) {
    return request(`${Helper.format(API.details.url, {id: payload.id})}?${qs.stringify(payload.params)}`)
}

export async function commentContent(payload) {
    return request(`${Helper.format(API.commentContent.url, {id: payload.id})}`)
}

export async function taskResult(payload) {
    return request(`${Helper.format(API.taskResult.url, {id: payload.id})}?${qs.stringify(payload.params)}`)
}