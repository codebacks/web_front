import config from 'community/config'

const {apiHost} = config

let API = {}

API.groupStat = {
    url: `${apiHost}/stats/chatroom`,
    type: 'GET'
}

API.groupStatExportTask = {
    url: `${apiHost}/stats/chatroom/export`,
    type: 'GET'
}

API.groupStatExportExcel = {
    url: `${apiHost}/stats/chatroom/export/status/{task_id}`,
    type: 'GET'
}


API.groupDist = {
    url: `${apiHost}/stats/chatroom/friend/stat`,
    type: 'GET'
}

export default API