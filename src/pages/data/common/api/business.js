'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: liyan [randonely@gmail.com]
 * 创建日期 18/09/13
 *
 */
import config from 'data/config'

const {apiHost} = config

let API = {}

API.reports = {
    url: `${apiHost}/stats/department_reports`,
    type: 'GET'
}

API.statsExportExcel = {
    url: `${apiHost}/stats/department_reports_export`,
    type: 'GET'
}

API.friendsReports = {
    url: `${apiHost}/stats/friend_reports`,
    type: 'GET'
}

API.wechatsReportsOverview = {
    url: `${apiHost}/stats/wechat/overview`,
    type: 'GET'
}
API.wechatsReports = {
    url: `${apiHost}/stats/wechat_reports`,
    type: 'GET'
}

API.wechatsReportsExportExcel = {
    url: `${apiHost}/stats/wechat_reports_export`,
    type: 'GET'
}

API.statsFriendsExportExcel = {
    url: `${apiHost}/stats/friend_reports_export`,
    type: 'GET'
}

export default API