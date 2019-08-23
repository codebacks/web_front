import request from 'data/utils/request'
import Helper from 'data/utils/helper'
import API from 'data/common/api/stats'
import qs from 'qs'

export async function queryWorkload(payload) {
    return request(`${Helper.format(API.workload.url)}?${qs.stringify(payload.params)}`)
}

export async function exportTask(payload) {
    return request(`${API.exportTask.url}?${qs.stringify(payload.params)}`)
}

export async function exportExcel(payload) {
    return request(Helper.format(API.exportExcel.url, {task_id: payload.taskId}), null, {
        returnResponse: true
    })
}