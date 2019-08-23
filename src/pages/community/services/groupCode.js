import request from 'community/utils/request'
import api from 'community/common/api/groupCode'
import {format} from 'utils'
import qs from 'qs'
import Helper from "utils/helper"

export async function drainageQuery(params) {
    return request(`${format(api.drainageQuery.url)}?${qs.stringify(params)}`)
}

export async function cancelled(params) {
    return request(format(api.cancelled.url, {id: params.id}), {
        method: api.cancelled.type,
        body: params,
    })
}

export async function addActivity(payload) {
    return request(api.addActivity.url, {
        method: api.addActivity.type,
        body: payload.body,
    })
}

export async function setActivity(payload) {
    return request(`${format(api.setActivity.url, {id: payload.id})}`, {
        method: api.setActivity.type,
        body: payload.body,
    })
}

export async function qrSetting(payload) {
    return request(`${format(api.qrSetting.url, {id: payload.id})}`, {
        method: api.qrSetting.type,
        body: payload.body,
    })
}


export async function getPageConfig(payload) {
    return request(format(api.getPageConfig.url, {id: payload.id}))
}

export async function setPageConfig(payload) {
    return request(format(api.setPageConfig.url, {group_activity_id: payload.id}), {
        method: api.setPageConfig.type,
        body: payload.body,
    })
}

export async function uploadBg(params) {
    return request(`${Helper.format(api.uploadBg.url)}?${qs.stringify(params)}`)
}

export async function queryGroupList(payload, params) {
    return request(`${format(api.queryGroupList.url, {group_activity_id: payload.group_activity_id})}?${qs.stringify(params)}`)
}

export async function queryMembersList(payload) {
    return request(format(api.queryMembersList.url, {group_activity_id: payload.group_activity_id, row_id: payload.row_id}))
}

export async function querySearchGroupList(params) {
    return request(`${api.querySearchGroupList.url}?${qs.stringify(params)}`)
}

export async function addSearchGroupList(payload) {
    return request(format(api.addSearchGroupList.url, {group_activity_id: payload.group_activity_id}), {
        method: api.addSearchGroupList.type,
        body: payload.body,
    })
}

export async function queryActivityStat(payload) {
    return request(format(api.queryActivityStat.url, {group_activity_id: payload.group_activity_id}))
}

export async function queryActivityGroupStat(payload) {
    return request(
        format(api.queryActivityGroupStat.url, {
            group_activity_id: payload.group_activity_id,
            group_activity_chatroom_id: payload.group_activity_chatroom_id
        })
    )
}

export async function switchActivityGroupStatus(payload) {
    return request(
        format(api.switchActivityGroupStatus.url, {
            group_activity_id: payload.group_activity_id,
            group_activity_chatroom_id: payload.group_activity_chatroom_id
        }), {
            method: api.switchActivityGroupStatus.type,
            body: payload.body,
        }
    )
}

export async function queryActivityTop() {
    return request(Helper.format(api.queryActivityTop.url))
}

export async function switchActivityStatus(payload) {
    return request(
        format(api.switchActivityStatus.url, {
            group_activity_id: payload.group_activity_id,
        }), {
            method: api.switchActivityStatus.type,
            body: payload.body,
        }
    )
}

export async function queryActivityGroupTop(payload) {
    return request(Helper.format(api.queryActivityGroupTop.url, {
        group_activity_id: payload.group_activity_id
    }))
}

export async function uploadGroupQrcode(payload) {
    return request(
        format(api.uploadGroupQrcode.url, {
            group_activity_id: payload.group_activity_id,
            row_id: payload.row_id,
        }), {
            method: api.uploadGroupQrcode.type,
            body: payload.body,
        }
    )
}

export async function autoUploadGroupQrcode(payload) {
    return request(
        format(api.autoUploadGroupQrcode.url, {
            group_activity_id: payload.group_activity_id,
            row_id: payload.row_id,
        }), {
            method: api.autoUploadGroupQrcode.type,
        }
    )
}

export async function deleteGroup(payload) {
    return request(
        format(api.deleteGroup.url, {
            group_activity_id: payload.group_activity_id,
            row_id: payload.row_id,
        }), {
            method: api.deleteGroup.type,
        }
    )
}

export async function getGroupMemberExtra(payload) {
    return request(format(api.getGroupMemberExtra.url, {group_activity_id: payload.group_activity_id, row_id: payload.row_id,}))
}

export async function getAutoUploadQrcodeStatus(payload) {
    return request(format(api.getAutoUploadQrcodeStatus.url, {group_activity_id: payload.group_activity_id, row_id: payload.row_id,}))
}

export async function setExcludeScanRepeat(payload) {
    return request(
        format(api.setExcludeScanRepeat.url, {
            group_activity_id: payload.group_activity_id,
        }), {
            method: api.setExcludeScanRepeat.type,
            body: payload.body,
        }
    )
}






