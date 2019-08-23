'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期 16/10/6
 *
 */
import config from 'data/config'
import base from './base'

const {apiHost} = config

let API = base('stats')

API.workload = {
    url: apiHost + '/stats/workload',
    type: 'GET'
}

API.exportTask = {
    url: `${apiHost}/stats/chat/export`,
    type: 'GET'
}

API.exportExcel = {
    url: `${apiHost}/wechats/friends/export/status/{task_id}`,
    type: 'GET'
}

export default API
