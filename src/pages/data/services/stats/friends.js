import request from 'data/utils/request'
import Helper from 'data/utils/helper'
import API from 'data/common/api/stats/friends'
import qs from 'qs'

export async function queryWorkload(payload) {
    return request(`${API.workload.url}?${qs.stringify(payload.params)}`)
}

export async function exportTask(payload) {
    return request(`${API.exportTask.url}?${qs.stringify(payload.params)}`)
}

export async function exportExcel(payload) {
    return request(Helper.format(API.exportExcel.url, {task_id: payload.taskId}), null, {
        returnResponse: true
    })
}

export async function queryBaseDist(payload) {
    return request(`${API.baseDist.url}?${qs.stringify(payload.params)}`)
}

export async function queryAreaDist(payload) {
    return request(`${API.areaDist.url}?${qs.stringify(payload.params)}`)
}

export async function queryPassList(params) {
    return request(`${API.passList.url}?${qs.stringify(params)}`)
}