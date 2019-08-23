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

let API = base('wechats')

API.messages = {
    url: apiHost + '/wechats/{uin}/messages',
    type: 'GET'
}
export default API
