import request from 'crm/utils/request'
import Helper from 'crm/utils/helper'
import API from 'crm/common/api/massMsg/record'
import qs from 'qs'

export async function create(body) {
    return request(API.create.url, {
        method: API.create.type,
        body: body,
    })
}

export async function tasks(params) {
    return request(`${Helper.format(API.tasks.url)}?${qs.stringify(params)}`)
}

export async function details(params) {
    return request(`${Helper.format(API.details.url, {id: params.id})}?${qs.stringify(params.query)}`)
}

export async function taskResult(params) {
    return request(`${Helper.format(API.taskResult.url, {id: params.id})}`)
}

export async function cancelExecution(params) {
    return request(`${Helper.format(API.cancelExecution.url, {id: params.id})}`,{
        method: API.cancelExecution.type,
    })
}

export async function reExecution(params) {
    return request(`${Helper.format(API.reexecution.url, {task_id: params.task_id})}`,{
        method: API.reexecution.type,
        body: {
            ids: params.ids
        }
    })
}