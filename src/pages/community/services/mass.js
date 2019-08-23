import request from 'community/utils/request'
import api from 'community/common/api/mass'
import {format} from 'utils'
import qs from 'qs'

export async function tasks(params) {
    return request(`${format(api.tasks.url)}?${qs.stringify(params)}`)
}

export async function groupingsSummary(params) {
    return request(`${format(api.groupingsSummary.url)}?${qs.stringify(params)}`)
}

export async function details(params) {
    return request(`${format(api.details.url, {id: params.id})}?${qs.stringify(params)}`)
}

export async function task(params) {
    return request(`${format(api.task.url, {id: params.id})}?${qs.stringify(params)}`)
}

export async function cancelled(params) {
    return request(format(api.cancelled.url, {id: params.id}), {
        method: api.cancelled.type,
        body: params,
    })
}

export async function reExecute(params) {
    return request(format(api.reExecute.url, {task_id: params.taskId}), {
        method: api.reExecute.type,
        body: params,
    })
}

export async function search(params) {
    return request(format(api.search.url), {
        method: api.search.type,
        body: params,
    })
}

export async function sendTask(params) {
    return request(format(api.sendTask.url), {
        method: api.sendTask.type,
        body: params,
    })
}

export async function exitsCount(params) {
    return request(format(api.exitsCount.url), {
        method: api.exitsCount.type,
        body: params,
    })
}

// 明细的数据导出
export async function exportTask(payload, params) {
    return request(`${format(api.exportTask.url, {id: payload.id})}?${qs.stringify(params)}`)
}
export async function exportExcel(payload) {
    return request(format(api.exportExcel.url, {task_id: payload.taskId}), null, {
        returnResponse: true
    })
}

// 群发消息列表的数据导出
export async function exportTaskMsg(params) {
    return request(`${api.exportTaskMsg.url}?${qs.stringify(params)}`)
}

// 检查是否有群发次数
export async function checkMass() {
    return request(api.checkMass.url)
}