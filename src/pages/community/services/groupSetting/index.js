import request from 'community/utils/request'
import api from 'community/common/api/groupSetting'
import {format} from 'utils'
import qs from 'qs'

export async function chatroomCommonsSettings(params) {
    return request(`${format(api.chatroomCommonsSettings.url)}?${qs.stringify(params)}`)
}

export async function chatroomCommonsSetStatus(params) {
    return request(api.chatroomCommonsSetStatus.url, {
        method: api.chatroomCommonsSetStatus.type,
        body: params.body,
    })
}



