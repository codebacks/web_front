import qs from 'qs'
import request from '../utils/request'
import Helper from '../utils/helper'
import API from 'platform/common/api/smsAccount'

// 购买短信列表
export async function getBuySMSList(params) {
    return request(`${API.getBuySMSList.url}?${qs.stringify(params)}`)
}
// 短信剩余条数
export async function getSMSCount(params) {
    return request(`${API.getSMSCount.url}`)
}