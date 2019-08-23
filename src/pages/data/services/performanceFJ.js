import request from 'data/utils/request'
import Helper from 'data/utils/helper'
import API from 'data/common/api/performanceFJ'
import qs from 'qs'

export async function queryService(payload) {
    return request(`${Helper.format(API.serviceReport.url)}?${qs.stringify(payload.params)}`)
}

export async function queryFriends(payload) {
    return request(`${Helper.format(API.friendsReport.url)}?${qs.stringify(payload.params)}`)
}

export async function exportFriendsTask(payload) {
    return request(`${API.exportFriendsTask.url}?${qs.stringify(payload.params)}`)
}

export async function exportFriendsExcel(payload) {
    return request(Helper.format(API.exportFriendsExcel.url, {task_id: payload.taskId}), null, {
        returnResponse: true
    })
}