import request from 'community/utils/request'
import API from 'community/common/api/groupSetting/actionManage'
import {format} from 'utils'
import qs from 'qs'

export async function queryActionManage(params) {
    return request(`${API.queryActionManage.url}?${qs.stringify(params)}`)
}

export async function setActionManage(payload) {
    return request(API.setActionManage.url, {
        method: API.setActionManage.type,
        body: payload.body,
    })
}

export async function getActionSettingState(payload) { // 获取自定义/全局，use_custom
    return request(`${format(API.getActionSettingState.url, {chatroom_name: payload.chatroom_name})}`)
}

export async function setActionSettingState(payload) { // 设置自定义/全局，use_custom
    return request(`${format(API.setActionSettingState.url, {chatroom_name: payload.chatroom_name})}`, {
        method: API.setActionSettingState.type,
        body: payload.body,
    })
}

export async function exportExcel(payload) {
    return request(`${API.exportExcel.url}?${qs.stringify(payload?.params)}`, {
        method: API.exportExcel.type,
    }, {
        returnResponse: true
    })
}