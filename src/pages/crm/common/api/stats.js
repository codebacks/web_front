'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期 16/10/6
 *
 */
import config from 'crm/config'
import base from 'crm/common/api/base'

const {apiHost} = config

let API = base('stats')

API.WORKLOAD = {
    url: apiHost + '/stats/workload',
    type: 'GET'
}

export default API
