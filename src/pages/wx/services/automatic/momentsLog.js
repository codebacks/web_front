import request from 'wx/utils/request'
import Helper from 'wx/utils/helper'
import API from 'wx/common/api/automatic/momentsLog'
import qs from 'qs'

export async function details(params) {
    return request(`${Helper.format(API.details.url)}?${qs.stringify(params)}`)
}

export async function result(params) {
    return request(`${Helper.format(API.result.url)}?${qs.stringify(params)}`)
}

export async function momentContent(params) {
    return request(`${Helper.format(API.momentContent.url, {id: params.id})}`)
}

export async function momentDetail(params) {
    return request(`${Helper.format(API.momentDetail.url, {task_id: params.taskId, history_id: params.historyId})}`)
}