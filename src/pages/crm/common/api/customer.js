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

let API = base('customers')
API.SEARCH = {
    url: config.apiHost + '/customers/search',
    type: 'POST'
}

API.PLAN_CUSTOMERS = {
    url: config.apiHost + '/plans/{id}/customers',
    type: 'POST'
}

API.STAT = {
    url: config.apiHost + '/customers/{id}/stat',
    type: 'GET'
}

API.CUSTOMER_PLANS = {
    url: config.apiHost + '/plans/customers/{id}',
    type: 'GET'
}

API.CUSTOMER_DETAIL = {
    url: config.apiHost + '/customers/{id}/detail',
    type: 'GET'
}

API.EXPORT_CUSTOMERS = {
    url: config.apiHost + '/customers/export',
    type: 'POST'
}

API.DOWNLOAD_EXPORT_CUSTOMERS = {
    url: config.apiHost + '/customers/export/download/{task_id}',
    type: 'GET'
}

API.QUERY_EXPORT_CUSTOMERS = {
    url: config.apiHost + '/customers/export/task/{task_id}',
    type: 'GET'
}

// 检查是否有群发次数
API.checkMass = {
    url: config.apiHost + '/mass_sending/customers/check',
    type: 'GET'
}

export default API