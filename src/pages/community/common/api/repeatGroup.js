import config from 'community/config'

const {apiHost} = config

let API = {}

API.query = {
    url: `${apiHost}/wechats/chatroom/repetition/report`,
    type: 'GET'
}

API.queryStatistics = {
    url: `${apiHost}/wechats/chatroom/repetition/statistics`,
    type: 'GET'
}

API.whitelistAdd = {
    url: `${apiHost}/wechats/white_list`,
    type: 'POST'
}

API.queryRepeatGroup = {
    url: `${apiHost}/wechats/chatroom/repetition/{wx_id}`,
    type: 'GET'
}

API.clearRepeatGroup = {
    url: `${apiHost}/wechats/chatroom/repetition/{wx_id}/clean`,
    type: 'PUT'
}

API.addBlackList = {
    url: `${apiHost}/wechats/black_list/add`,
    type: 'PUT'
}

export default API
