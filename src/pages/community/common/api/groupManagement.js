import config from 'community/config'

const {apiHost} = config

let API = {}

API.getAllUsers = {
    url: `${apiHost}/wechats/chat_rooms/ids`,
    type: 'GET',
}

API.groupList = {
    url: `${apiHost}/wechats/chat_rooms`,
    type: 'GET',
}

API.groupDetail = {
    url: `${apiHost}/wechats/{uin}/chat_rooms/{username}`,
    type: 'GET',
}

API.updateGroup = {
    url: `${apiHost}/wechats/{uin}/chat_rooms/{username}`,
    type: 'PUT',
}

API.inviteRecords = {
    url: `${apiHost}/wechats/chat_rooms/invite_records`,
    type: 'GET',
}

API.inviteRecordsConfirm = {
    url: `${apiHost}/wechats/chat_rooms/invite_records/confirm`,
    type: 'POST',
}

// edit by XuMengPeng
API.batchEditGroupNotice = {
    url: `${apiHost}/wechats/chat_rooms/notice`,
    type: 'PUT',
}

// edit by XuMengPeng
API.getGroupNoticeRecord = {
    url: `${apiHost}/wechats/chat_rooms/notice/tasks`,
    type: 'GET',
}

// edit by XuMengPeng
API.getGroupNoticeRecordDetail = {
    url: `${apiHost}/wechats/chat_rooms/notice/tasks/{task_id}/detail`,
    type: 'GET',
}

// edit by XuMengPeng
API.cancelExecuteGrouupNotice = {
    url: `${apiHost}/wechats/chat_rooms/notice/tasks/{task_id}/cancel`,
    type: 'POST',
}

// edit by XuMengPeng
API.reExecuteGrouupNotice = {
    url: `${apiHost}/wechats/chat_rooms/notice/tasks/{task_id}/redo/{detail_id}`,
    type: 'POST',
}

// edit by XuMengPeng
API.queryGroupMembers = {
    url: `${apiHost}/wechats/{uin}/chat_rooms/{username}/members`,
    type: 'GET',
}

API.queryAddReplyMember = {
    url: `${apiHost}/wechats/{uin}/chat_rooms/{username}/replier/{type}`,
    type: 'GET',
}

API.setAddReplyMember = {
    url: `${apiHost}/wechats/chat_rooms/chatroom_commons_settings/{chatroom_id}/mission_uin`,
    type: 'POST',
}

API.groupListStatistics = {
    url: `${apiHost}/wechats/chat_rooms/worker/statistics`,
    type: 'GET'
}

API.getGroupDivideOptions = {
    url: `${apiHost}/wechats/chat_rooms/groupings/summary`,
    type: 'GET'
}

API.setGroupDivide = {
    url: `${apiHost}/wechats/chat_rooms/grouping/{id}/chatrooms`,
    type: 'POST'
}

API.exportTask = {
    url: `${apiHost}/wechats/chat_rooms/export`,
    type: 'GET'
}

API.exportStatus = {
    url: `${apiHost}/wechats/chat_rooms/export/task/{task_id}`,
    type: 'GET'
}

/*API.exportExcel = {
    url: `${apiHost}/customers/export/download/{task_id}`,
    type: 'GET'
}*/

API.checkWorkGroup = {
    url: `${apiHost}/wechats/chat_rooms/worker/batch_setting/check`,
    type: 'POST'
}

API.setWorkGroup = {
    url: `${apiHost}/wechats/chat_rooms/worker/batch_setting`,
    type: 'POST'
}

// 批量设置自动回复
API.queryAutoReplyGlobal = {
    url: `${apiHost}/setting_group_auto_reply_v3`,
    type: 'GET',
}
API.getAutoReplySetting = {
    url: `${apiHost}/setting_group_auto_reply_v3/commons`,
    type: 'GET',
}
API.setAutoReplySetting = {
    url: `${apiHost}/setting_group_auto_reply_v3/commons`,
    type: 'POST',
}
API.getAutoReplyTemplates = {
    url: `${apiHost}/setting_group_auto_reply_v3/templates`,
    type: 'GET',
}
API.getAutoReplyReplyContents = {
    url: `${apiHost}/knowledge_base/category/item/{id}`,
    type: 'GET',
}
API.getAutoReplyTemplateDetail = {
    url: `${apiHost}/setting_group_auto_reply_v3/template/{template_id}/keywords`,
    type: 'GET',
}

// 检查是否有批量修改群公告次数
API.checkMass = {
    url: `${apiHost}/wechats/chat_rooms/notice/batch/status`,
    type: 'GET',
}


export default API
