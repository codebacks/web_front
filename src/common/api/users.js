'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期 16/10/6
 *
 */

import config from 'config'
import base from './base'

let API = base('users')

API.sub = {
    url: config.apiHost + '/api/users/sub',
    type: 'GET'
}

API.summary = {
    url: config.apiHost + '/api/users/summary',
    type: 'GET'
}

API.CHILDREN = {
    url: config.apiHost + '/api/users/children',
    type: 'GET',
}

API.QUERY_BY_COMPANY = {
    url: config.apiHost + '/api/users/by_company',
    type: 'GET',
}

API.UPDATE_PASSWORD = {
    url: config.apiHost + '/api/users/me/password',
    type: 'PUT',
}

API.updateMe = {
    url: config.apiHost + '/api/users/me',
    type: 'PUT',
}

API.verifyMe = {
    url: config.apiHost + '/api/users/me/verify',
    type: 'POST',
}

API.changeMobile = {
    url: config.apiHost + '/api/users/me/mobile',
    type: 'PUT',
}

API.findPassword = {
    url: config.apiHost + '/api/users/password',
    type: 'PUT',
}

export default API