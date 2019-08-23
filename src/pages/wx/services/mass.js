import request from 'wx/utils/request'
import api from 'wx/common/api/mass'
import {format} from 'utils'
import qs from 'qs'

export async function tasks(params) {
    return request(`${format(api.tasks.url)}?${qs.stringify(params)}`)
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