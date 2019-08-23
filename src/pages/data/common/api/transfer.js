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

let API = base('transfers')
API.stats = {
    url: apiHost + '/transfers/stats',
    type: 'GET'
}
API.update_transfer = {
    url: apiHost + '/transfers/transfer_id/{id}',
    type: 'PUT'
}
API.update_amount = {
    url: apiHost + '/transfers/transfer_id/{id}',
    type: 'PUT'
}
API.bind_order = {
    url: apiHost + '/transfers/message_id/{id}',
    type: 'PUT'
}
API.export = {
    url: apiHost + '/transfers/export',
    type: 'GET'
}

export default API