import request from 'wx/utils/request'
import Helper from 'wx/utils/helper'
import API from 'wx/common/api/automatic/moments'
import qs from 'qs'

export async function tasks(params) {
    return request(`${Helper.format(API.tasks.url)}?${qs.stringify(params)}`)
}

export async function shareMoments(body) {
    return request(API.shareMoments.url, {
        method: API.shareMoments.type,
        body: body,
    })
}

export async function details(params) {
    return request(`${Helper.format(API.details.url, {id: params.id})}?${qs.stringify(params)}`)
}

export async function taskResult(params) {
    return request(`${Helper.format(API.taskResult.url, {id: params.id})}?${qs.stringify(params.params)}`)
}

export async function cancelExecution(params) {
    return request(`${Helper.format(API.cancelExecution.url, {id: params.id})}`,{
        method: API.cancelExecution.type,
    })
}

export async function reExecution(params) {
    return request(`${Helper.format(API.reexecution.url, {id: params.id, history_id: params.historyId})}`,{
        method: API.reexecution.type,
    })
}

export async function getArticleExtract(body) {
    return request(API.articleExtract.url, {
        method: API.articleExtract.type,
        body: body,
    })
}

export async function getLabels(params) {
    return request(`${API.labels.url}?${qs.stringify(params)}`)
}

export async function getVideoInfo(url) {
    return request(url, {
        credentials: 'omit'
    })
}

export async function getDefaultWatermark(params) {
    return request(`${API.defaultWatermark.url}?${qs.stringify(params)}`)
}

export async function cutVideo(payload) {
    return request(`${API.cutVideo.url}`, {
        method: API.cutVideo.type,
        body: payload.body
    })
}

export async function verifyVideo(payload) {
    return request(`${API.verifyVideo.url}`, {
        method: API.verifyVideo.type,
        body: payload.body
    })
}

export async function taskCount() {
    return request(API.taskCount.url)
}
