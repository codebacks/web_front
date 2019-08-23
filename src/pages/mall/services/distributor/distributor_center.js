import { stringify } from 'qs'
import request from 'mall/utils/request'
import api from '../../common/api/distributor/distributor_center'

// 开通状态
export const STATUS = {
    'isStatus': 1,//已开通
    'unStatus': 2 //已关闭
}

// 分销员招募条件
export const CONDITIONS_TYPE = {
    'orderQuantity': 1,//订单数量
    'orderAmount': 2,//订单金额
    'noRestriction': 3//不限制
}

//佣金结算时间
export const SETTLEMENT_TYPE = {
    'orderEnd': 1,//订单完成后结算
    'orderSeven': 2//订单完成后7天结算
}

export async function centerList(params) {
    return request(`${api.centerList.url}?${stringify(params)}`)
}

// 是否开通
export async function isOpen(params) {
    return request(`${api.isOpen.url}?${stringify(params)}`)
}

//设置分销员
export async function create(params) {
    return request(api.create.url, {
        method: api.create.type,
        body: params,
    })
}

//编辑分销员
export async function update(params) {
    return request(api.update.url, {
        method: api.update.type,
        body: params,
    })
}