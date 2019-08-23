'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: liyan [randonely@gmail.com]
 * 创建日期 18/10/11
 *
 */
import config from 'data/config'

const {apiHost} = config

let API = {}

API.serviceReport = {
    url: `${apiHost}/performance/service`,
    type: 'GET'
}

API.serviceReportExport = {
    url: `${apiHost}/performance/service_export`,
    type: 'GET'
}

API.friendsReport = {
    url: `${apiHost}/performance/friends`,
    type: 'GET'
}

API.exportFriendsTask = {
    url: `${apiHost}/performance/friends_export`,
    type: 'GET'
}

API.exportFriendsExcel = {
    url: `${apiHost}/performance/friends_export/status/{task_id}`,
    type: 'GET'
}


export default API