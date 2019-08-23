import request from 'crm/utils/request'
import Helper from 'crm/utils/helper'
import api from 'crm/common/api/paySMS'
import {stringify} from 'qs'


export async function pressOrder(params) {
    return request(Helper.format(api.pressOrder.url), {
        method: api.pressOrder.type,
        body: params
    })
}
export async function payment(params) {
    return request(Helper.format(api.payment.url), {
        method: api.payment.type,
        body: params
    })
}

export async function recharge(params) {
    return request(Helper.format(api.recharge.url,{id: params.id}), {
        method: api.recharge.type,
        body: params
    })
}

export async function smsCount(params) {
    return request(`${Helper.format(api.smsCount.url)}?${stringify(params)}`)
}