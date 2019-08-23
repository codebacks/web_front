import request from 'wx/utils/request'
import { stringify } from 'qs'
import {format} from 'utils'
import API from 'wx/common/api/knowledgeLibrary'

// tree相关
export async function getTree() {
    return request(API.getTree.url)
}
export async function createTree(payload) {
    return request(API.createTree.url, {
        method: API.createTree.type,
        body: payload,
    })
}
export async function editTree(payload) {
    return request(format(API.editTree.url, {id: payload.id}), {
        method: API.editTree.type,
        body: payload,
    })
}
export async function removeTree(payload) {
    return request(format(API.removeTree.url, {id: payload.id}), {
        method: API.removeTree.type,
        body: payload,
    })
}

// questions相关
export async function getQuestions(payload, params) {
    return request(`${format(API.getQuestions.url, {id: payload.id})}?${stringify(params)}`)
}
export async function getReplyContents(payload, params) {
    return request(`${format(API.getReplyContents.url, {id: payload.id})}`)
}
export async function removeQuestion(payload) {
    return request(format(API.removeQuestion.url, {id: payload.id}), {
        method: API.removeQuestion.type,
    })
}
export async function moveQuestion(payload) {
    return request(format(API.moveQuestion.url, {id: payload.id}), {
        method: API.moveQuestion.type,
        body: payload.body,
    })
}
export async function addQuestion(payload) {
    return request(format(API.addQuestion.url, {id: payload.id}), {
        method: API.addQuestion.type,
        body: payload.body,
    })
}
export async function editQuestion(payload) {
    return request(format(API.editQuestion.url, {id: payload.id}), {
        method: API.editQuestion.type,
        body: payload.body,
    })
}
