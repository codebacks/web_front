import qs from 'qs'
import request from 'community/utils/request'
import Helper from 'community/utils/helper'
import API from 'community/common/api/groupManagement'
import {format} from "utils"

export async function getAllUsers(params) {
    return request(`${API.getAllUsers.url}?${qs.stringify(params)}`)
}

export async function queryGroupList(params) {
    return request(`${API.groupList.url}?${qs.stringify(params)}`)
}

export async function groupDetail(payload) {
    return request(`${Helper.format(API.groupDetail.url, {
        uin: payload.uin,
        username: payload.username,
    })}`)
}

export async function updateGroup(payload) {
    return request(Helper.format(API.updateGroup.url, {
        uin: payload.uin,
        username: payload.username,
    }), {
        method: API.updateGroup.type,
        body: payload.body,
    })
}

export async function inviteRecords(params) {
    return request(`${API.inviteRecords.url}?${qs.stringify(params)}`)
}

export async function inviteRecordsConfirm(params) {
    return request(API.inviteRecordsConfirm.url, {
        method: API.inviteRecordsConfirm.type,
        body: params,
    })
}


// edit by XuMengPeng
export async function batchEditGroupNotice(payload, params) {
    return request(`${API.batchEditGroupNotice.url}?${qs.stringify(params)}`,{
        method: API.batchEditGroupNotice.type,
        body: payload.body
    })
}

// edit by XuMengPeng
export async function getGroupNoticeRecord(params) {
    return request(`${API.getGroupNoticeRecord.url}?${qs.stringify(params)}`)
}

// edit by XuMengPeng
export async function getGroupNoticeRecordDetail(params, payload) {
    return request(`${Helper.format(API.getGroupNoticeRecordDetail.url, {task_id: payload.task_id})}?${qs.stringify(params)}`)
}

// edit by XuMengPeng
export async function cancelExecuteGrouupNotice(payload) {
    return request(`${Helper.format(API.cancelExecuteGrouupNotice.url, {task_id: payload.task_id})}`, {
        method: API.cancelExecuteGrouupNotice.type,
    })
}

// edit by XuMengPeng
export async function reExecuteGrouupNotice(payload) {
    return request(`${Helper.format(API.reExecuteGrouupNotice.url, {task_id: payload.task_id, detail_id: payload.detail_id})}`, {
        method: API.reExecuteGrouupNotice.type,
    })
}

export async function queryAddReplyMember(params, payload) {
    return request(`${Helper.format(API.queryAddReplyMember.url, {uin: payload.uin, username: payload.username, type: payload.type})}?${qs.stringify(params)}`)
}
// edit by XuMengPeng
export async function queryGroupMembers(params, payload) {
    return request(`${Helper.format(API.queryGroupMembers.url, {uin: payload.uin, username: payload.username})}?${qs.stringify(params)}`)
}

export async function setAddReplyMember(payload) {
    return request(`${Helper.format(API.setAddReplyMember.url, {chatroom_id: payload.chatroom_id})}`,{
        method: API.setAddReplyMember.type,
        body: payload.body
    })
}

export async function groupListStatistics() {
    return request(`${API.groupListStatistics.url}`)
}

export async function getGroupDivideOptions() {
    return request(`${API.getGroupDivideOptions.url}`)
}

export async function setGroupDivide(payload) {
    return request(`${Helper.format(API.setGroupDivide.url, {id: payload.id})}`,{
        method: API.setGroupDivide.type,
        body: payload.body
    })
}
export async function exportTask(params) {
    return request(`${API.exportTask.url}?${qs.stringify(params)}`)
}

export async function exportStatus(payload) {
    return request(Helper.format(API.exportStatus.url, {task_id: payload.taskId}), null, {
        returnResponse: true
    })
}

export async function checkWorkGroup(payload) {
    return request(API.checkWorkGroup.url,{
        method: API.checkWorkGroup.type,
        body: payload.body
    })
}

export async function setWorkGroup(payload) {
    return request(API.setWorkGroup.url,{
        method: API.setWorkGroup.type,
        body: payload.body
    })
}

// 批量设置自动回复
export async function queryAutoReplyGlobal(params) {
    return request(`${format(API.queryAutoReplyGlobal.url)}?${qs.stringify(params)}`)
}
export async function getAutoReplySetting(params) {
    return request(`${format(API.getAutoReplySetting.url, {
        uin: params.uin,
        group_username: params.group_username,
    })}?${qs.stringify(params)}`)
}
export async function setAutoReplySetting(payload) {
    return request(format(API.setAutoReplySetting.url), {
        method: API.setAutoReplySetting.type,
        body: payload.body,
    })
}
export async function getAutoReplyTemplates(params) {
    return request(`${format(API.getAutoReplyTemplates.url)}?${qs.stringify(params)}`)
}
export async function getAutoReplyReplyContents(payload) {
    return request(`${format(API.getAutoReplyReplyContents.url, {id: payload.id})}`)
}
export async function getAutoReplyTemplateDetail(payload) {
    return request(`${format(API.getAutoReplyTemplateDetail.url, {template_id: payload.template_id})}`)
}

// 检查是否有批量修改群公告次数
export async function checkMass() {
    return request(API.checkMass.url)
}