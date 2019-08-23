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

let API = base('orders')
API.IMPORT = {
    url: config.apiHost + '/imports',
    type: 'POST'
}
API.LIST_ALL = {
    url: config.apiHost + '/orders/all',
    type: 'POST'
}
API.IMPORT_STATUS = {
    url: config.apiHost + '/imports/{id}',
    type: 'GET'
}
export default API