'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期 16/10/6
 *
 */
import base from 'crm/common/api/base'
import config from "crm/config"

const {apiHost} = config

let API = base('tags')

API.stat = {
    url: `${apiHost}/tags/stat`,
    type: 'GET',
}

API.statExport = {
    url: `${apiHost}/tags/stat/export`,
    type: 'GET',
}

export default API