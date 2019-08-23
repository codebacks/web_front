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

let API = base('transfers')
API.STATS = {
    url: config.apiHost + '/transfers/stats',
    type: 'GET'
}
API.UPDATE_TRANSFER = {
    url: config.apiHost + '/transfers/transfer_id/{id}',
    type: 'PUT'
}
API.UPDATE_AMOUNT = {
    url: config.apiHost + '/transfers/transfer_id/{id}',
    type: 'PUT'
}
API.BIND_ORDER = {
    url: config.apiHost + '/transfers/message_id/{id}',
    type: 'PUT'
}
API.EXPORT = {
    url: config.apiHost + '/transfers/export',
    type: 'GET'
}

export default API