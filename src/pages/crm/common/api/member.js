'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期 16/10/6
 *
 */
import config from '../config'
import base from './base'

const {apiHost} = config

let API = base('members')
API.IMPORT = {
    url: apiHost + '/imports/member',
    type: 'POST'
}
API.IMPORT_STATUS = {
    url: apiHost + '/imports/{id}',
    type: 'GET'
}
export default API