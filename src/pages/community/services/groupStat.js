import qs from 'qs'
import request from 'community/utils/request'
import API from 'community/common/api/groupStat'
import Helper from "community/utils/helper"

export async function queryGroupStat(params) {
    return request(`${API.groupStat.url}?${qs.stringify(params)}`)
}

export async function exportTask(payload) {
    return request(`${API.groupStatExportTask.url}?${qs.stringify(payload.params)}`)
}

export async function exportExcel(payload) {
    return request(Helper.format(API.groupStatExportExcel.url, {task_id: payload.taskId}), null, {
        returnResponse: true
    })
}

export async function queryGroupDist(params) {
    return request(`${API.groupDist.url}?${qs.stringify(params)}`)
}