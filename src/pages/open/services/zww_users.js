/*
 * @Author: sunlizhi 
 * @Date: 2018-11-30 16:58:31 
 * @Last Modified by: sunlizhi
 * @Last Modified time: 2018-12-05 18:07:52
 */
import qs from 'qs'
import request from '../utils/request'
import Helper from '../utils/helper'
import API from '../common/api/zww_users'

export async function getUserManagementList(params) {
    return request(`${API.getUserManagementList.url}?${qs.stringify(params)}`)
}

export async function accountRecord(params) {
    return request(Helper.format(API.accountRecord.url,{ doll_id: params.id }))
}

export async function sentRecords(params) {
    return request(`${API.sentRecords.url}?${qs.stringify(params)}`)
}

export async function consumeRecords(params) {
    return request(`${API.consumeRecords.url}?${qs.stringify(params)}`)
}

// export async function payment(params) {
//     return request(Helper.format(API.payment.url,{ id: params.id }), {
//         method: API.payment.type,
//         body: params
//     })
// }
