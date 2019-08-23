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

API.getActionSettingState = {
    url: `${apiHost}/chatroom/setting_behavior_manage/chatrooms/{chatroom_name}/state`,
    type: 'GET'
}

API.setActionSettingState = {
    url: `${apiHost}/chatroom/setting_behavior_manage/chatrooms/{chatroom_name}/state`,
    type: 'POST'
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
