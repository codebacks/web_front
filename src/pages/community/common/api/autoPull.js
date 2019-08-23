import config from 'community/config'

const {apiHost} = config
let API = {}

API.queryAutoPull = {
    url: `${apiHost}/setting_auto_group/wechats`,
    type: 'GET',
}
API.setAutoPull = {
    url : `${apiHost}/setting_auto_group/uin/{uin}`,
    type: 'POST'
}
API.deteleAutoPull = {
    url : `${apiHost}/setting_auto_group/wechat`,
    type: 'DELETE'
}
API.addKeyword = {
    url : `${apiHost}/setting_auto_group/uin/{uin}/keyword`,
    type: 'PUT'
}
API.removeKeyword = {
    url : `${apiHost}/setting_auto_group/uin/{uin}/keyword`,
    type: 'DELETE'
}

API.getGroupDivideOptions = {
    url: `${apiHost}/wechats/chat_rooms/groupings/summary`,
    type: 'GET'
}
API.queryAutoPullModal = {
    url : `${apiHost}/setting_auto_group/uin/{uin}`,
    type: 'GET'
}
API.updateAutoPullModalItem = {
    url : `${apiHost}/setting_auto_group/uin/{uin}/chatroom/{chatroom_name}`,
    type: 'POST'
}

API.queryAddWechatModal = {
    url: `${apiHost}/wechats/auto_group/candidate`,
    type: 'GET',
}
API.setAddWechatModal = {
    url : `${apiHost}/setting_auto_group/wechat`,
    type: 'POST'
}

API.queryAutoPullRecord = {
    url: `${apiHost}/setting_auto_group/tasks`,
    type: 'GET',
}
API.autoPullRecordStatistics = {
    url: `${apiHost}/setting_auto_group/tasks/statistics`,
    type: 'GET',
}

export default API
