'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期 16/10/6
 *
 */
import base from './base'
import config from 'wx/config'

const {apiHost} = config

let API = base('replies')
API.SWAP = {
	url: apiHost + '/replies/swap',
	type: 'POST'
}
API.SET_TOP = {
	url: apiHost + '/replies/set_top',
	type: 'POST'
}
export default API