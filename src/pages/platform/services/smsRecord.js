import qs from 'qs'
import request from '../utils/request'
import Helper from '../utils/helper'
import API from 'platform/common/api/smsRecord'

// 查询短信发送列表
export async function getMsmSendList(params) {
    return request(`${API.getMsmSendList.url}?${qs.stringify(params)}`)
}

// 查询短信发送错误列表
export async function getMsmSendReportList(params) {
    return request(`${API.getMsmSendReportList.url +params.send_history_id }/records?${qs.stringify(params)}`)
}
