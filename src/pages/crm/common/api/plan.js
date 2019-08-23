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

let API = base('plans')
API.REMOVE = {
    url: config.apiHost + '/plans/{id}/remove',
    type: 'PUT'
}
API.CUSTOMERS = {
    url: config.apiHost + '/plans/{id}/customers',
    type: 'GET'
}
API.REMOVE_CUSTOMER = {
    url: config.apiHost + '/plans/{plan_id}/customers/{customer_id}',
    type: 'DELETE'
}
export default API