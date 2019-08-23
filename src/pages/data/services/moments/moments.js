import qs from 'qs'
import request from "data/utils/request"
import API from "data/common/api/moments/moments"
import Helper from "data/utils/helper"

export async function momentsSummary(payload) {
    return request(`${Helper.format(API.momentsSummary.url)}?${qs.stringify(payload)}`)
}

export async function momentsStat(payload) {
    return request(`${Helper.format(API.momentsStat.url)}?${qs.stringify(payload)}`)
}

export async function momentsStatByDate(payload) {
    return request(`${Helper.format(API.momentsStatByDate.url)}?${qs.stringify(payload)}`)
}

export async function exportTask(payload) {
    return request(`${API.exportTask.url}?${qs.stringify(payload.params)}`)
}

export async function exportExcel(payload) {
    return request(Helper.format(API.exportExcel.url, {task_id: payload.taskId}), null, {
        returnResponse: true
    })
}
