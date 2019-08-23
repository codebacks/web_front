'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: liyan [randonely@gmail.com]
 * 创建日期 18/11/7
 *
 */
import config from 'data/config'
import base from '../base'

const {apiHost} = config

let API = base('stats')

API.workload = {
    url: `${apiHost}/stats/workload`,
    type: 'GET'
}

API.exportTask = {
    url: `${apiHost}/stats/friend/export`,
    type: 'GET'
}

API.exportExcel = {
    url: `${apiHost}/wechats/friends/export/status/{task_id}`,
    type: 'GET'
}


API.baseDist = {
    url: `${apiHost}/stats/friend/distribution`,
    type: 'GET'
}

API.areaDist = {
    url: `${apiHost}/stats/friend/distribution/location`,
    type: 'GET'
}

API.passList = {
    url: `${apiHost}/wechats/friends/apply/stat`,
    type: 'GET'
}



export default API
