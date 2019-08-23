import { stringify } from 'qs'
import Helper from 'utils/helper'
import request from 'mall/utils/request'
import api from '../../common/api/distributor/commissions'
import _ from 'lodash'

function getdistribute(items, value) {
    const v = _.toInteger(value)
    const type = _.find(items, c => c.value === v)
    return type && type.text
}

export const STATUS = [
    { text: '待审核', value: 1, code: 'pending' },
    { text: '已审核', value: 2, code: 'valid' },
    { text: '已打款', value: 3, code: 'already' },
    { text: '打款失败', value: 4, code: 'failure' }
]

export function getStatus(value) {
    return getdistribute(STATUS, value)
}

export function getStatusCode(code, value) {
    return STATUS.find(item => item.code === code, value)
}



export async function commissionsList(params) {
    return request(`${api.commissionsList.url}?${stringify(params)}`)
}

// 通过
export async function pass(params) {
    return request(Helper.format(api.pass.url, { id: params.id }), {
        method: api.pass.type,
        body: params,
    })
}

// 重新打款
export async function transactions(params) {
    return request(Helper.format(api.transactions.url, { withdraw_id: params.id }), {
        method: api.transactions.type,
        body: params,
    })
}