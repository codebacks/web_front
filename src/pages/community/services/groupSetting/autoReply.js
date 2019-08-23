import request from 'community/utils/request'
import api from 'community/common/api/groupSetting/autoReply'
import {format} from 'utils'
import qs from 'qs'

export async function queryGlobal(params) {
    return request(`${format(api.queryGlobal.url)}?${qs.stringify(params)}`)
}

export async function getSetting(params) {
    return request(`${format(api.getSetting.url, {
        uin: params.uin,
        group_username: params.group_username,
    })}?${qs.stringify(params)}`)
}

export async function setSetting(payload) {
    return request(format(api.setSetting.url), {
        method: api.setSetting.type,
        body: payload.body,
    })
}

export async function getTemplates(params) {
    return request(`${format(api.getTemplates.url)}?${qs.stringify(params)}`)
}

export async function getReplyContents(payload) {
    return request(`${format(api.getReplyContents.url, {id: payload.id})}`)
}

export async function getTemplateDetail(payload) {
    return request(`${format(api.getTemplateDetail.url, {template_id: payload.template_id})}`)
}