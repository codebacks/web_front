/**
 * 创建用户: liyan
 * 创建日期 19/05/23
 *
 */
import config from 'config'
import base from './base'

let API = base('device')

const {apiHost} = config

API.part = {
    url: `${apiHost}/api/devices/part`,
    type: 'GET'
}

API.group = {
    url: `${apiHost}/api/devices/groups`,
    type: 'GET'
}

export default API
