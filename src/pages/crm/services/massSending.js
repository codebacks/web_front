import request from 'crm/utils/request'
import api from 'crm/common/api/massSending'
import {format} from 'utils'
import qs from 'qs'

export async function tasks(params) {
    return request(`${format(api.tasks.url)}?${qs.stringify(params)}`)
}

export async function summary(params) {
    return request(`${format(api.summary.url, {id: params.id})}?${qs.stringify(params)}`)
}

export async function task(params) {
    return request(`${format(api.task.url, {id: params.id})}?${qs.stringify(params)}`)
}

export async function details(params) {
    return request(`${format(api.details.url, {id: params.id})}?${qs.stringify(params)}`)
}

export async function createTask(params) {
    return request(format(api.createTask.url), {
        method: api.createTask.type,
        body: params,
    })
}

export async function count(params) {
    return request(format(api.count.url), {
        method: api.count.type,
        body: params,
    })
}

export async function cancelled(params) {
    return request(format(api.cancelled.url, {id: params.id}), {
        method: api.cancelled.type,
        body: params,
    })
}

export async function exportTask(payload, params) {
    return request(`${format(api.exportTask.url, {id: payload.id})}?${qs.stringify(params)}`)
}

export async function exportExcel(payload) {
    return request(format(api.exportExcel.url, {task_id: payload.taskId}), null, {
        returnResponse: true
    })
}


