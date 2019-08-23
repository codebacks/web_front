import config from 'community/config'

const {apiHost} = config

let API = {}

API.queryActionManage = {
    url: `${apiHost}/chatroom/setting_behavior_manage`,
    type: 'GET'
}

API.setActionManage = {
    url: `${apiHost}/chatroom/setting_behavior_manage`,
    type: 'POST'
}

API.queryViolationRecord = {
    url: `${apiHost}/chatroom/group_behavior_manage/violation_records`,
    type: 'GET'
}

API.joinWhiteList = {
    url: `${apiHost}/chatroom/group_behavior_manage/violation_records/{id}/to_whitelist`,
    type: 'POST'
}

API.sendWarning = {
    url: `${apiHost}/chatroom/group_behavior_manage/violation_records/{id}/warn`,
    type: 'POST'
}


API.kickoutGroup = {
    url: `${apiHost}/chatroom/group_behavior_manage/violation_records/{id}/kickout`,
    type: 'POST'
}

API.queryKickRecord = {
    url: `${apiHost}/chatroom/group_behavior_manage/kickout_records`,
    type: 'GET'
}

API.getKickReasonType = {
    url: `${apiHost}/chatroom/group_behavior_manage/options`,
    type: 'GET'
}

API.exportExcel = {
    url: `${apiHost}/chatroom/setting_behavior_manage/sensitive_word/export`,
    type: 'POST'
}

API.importExcel = {
    url: `${apiHost}/chatroom/setting_behavior_manage/sensitive_word/import`,
    type: 'POST'
}

export default API
