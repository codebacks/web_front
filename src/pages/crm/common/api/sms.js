'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期 16/10/6
 *
 */


import config from 'crm/config'
import base from './base'

const {apiHost} = config

let API = base('sms')

API.CONFIG = {
    url: apiHost + '/sms/config',
    type: 'GET'
}
API.SET_CONFIG = {
    url: apiHost + '/sms/config',
    type: 'PUT'
}
API.TEMPLATES = {
    url: apiHost + '/sms/templates',
    type: 'GET'
}
API.CREATE_TEMPLATE = {
    url: apiHost + '/sms/templates',
    type: 'POST'
}
API.SEND = {
    url: apiHost + '/sms/send',
    type: 'POST'
}
API.CREATE_TASK = {
    url: apiHost + '/sms/tasks',
    type: 'POST'
}
API.TASKS = {
    url: apiHost + '/sms/tasks',
    type: 'GET'
}
API.UPDATE_TEMPLATE = {
    url: apiHost + '/sms/templates/{id}',
    type: 'PUT'
}
API.DELETE_TEMPLATE = {
    url: apiHost + '/sms/templates/{id}',
    type: 'DELETE'
}
API.TASKS_DETAIL = {
    url: apiHost + '/sms/tasks/{id}',
    type: 'GET'
}

API.CREATE_SIGN = {
    url: apiHost + '/sms/signs',
    type: 'POST'
}
API.SIGNS = {
    url: apiHost + '/sms/signs',
    type: 'GET'
}
API.STORE_SIGNS = {
    url: apiHost + '/sms/signs/store',
    type: 'GET'
}
API.DELETE_SIGN = {
    url: apiHost + '/sms/signs/{id}',
    type: 'DELETE'
}
API.DATE_USED = {
    url: apiHost + '/sms/used',
    type: 'GET'
}
export default API