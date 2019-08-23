import { stringify } from 'qs'
import Helper from 'utils/helper'
import request from '../../../utils/request'
import api from '../common/api/examine'
import { format } from 'utils'
import _ from 'lodash'


function getExamine(items, value) {
    const v = _.toInteger(value)
    const type = _.find(items, c => c.value === v)
    return type && type.text
}

export const EXAMINE_STATUS = [
    { value: 4, text: '待确认', code: 'confirmed' },
    { value: 1, text: '待审核', code: 'pending' },
    { value: 2, text: '已通过', code: 'valid' },
    { value: 3, text: '已拒绝', code: 'refused' }
]

export function getStatus(code, value) {
    return EXAMINE_STATUS.find(item => item.code === code, value)
}

// 付款状态
export const EXAMINE_PAY_STATUS = [
    { value: 4, text: '待付款', code: 'pending' },
    { value: 1, text: '付款中', code: 'payment' },
    { value: 2, text: '已付款', code: 'alreadyPaid' },
    { value: 3, text: '付款失败', code: 'fail' },
]

export function getPayStatus(code, value) {
    return EXAMINE_PAY_STATUS.find(item => item.code === code, value)
}

export const EXAMINE_CONFIRM_TYPE = {
    'automatic': 1,
    'alreadyPaid': 2
}

export function getConfirmtype(value) {
    return getExamine(EXAMINE_CONFIRM_TYPE, value)
}

//活动状态
export const ACTIVITIESDETAIL_STATUS = [
    { value: 3, text: '未开始' },
    { value: 1, text: '进行中' },
    { value: 2, text: '已结束' },
]
export function getActivitieStatus(value) {
    return getExamine(ACTIVITIESDETAIL_STATUS, value)
}

// 过滤
export const IS_PARALLEL = [
    { value: 1, text: '过滤' },
    { value: 2, text: '不过滤' },
]
export function getIsParallel(value) {
    return getExamine(IS_PARALLEL, value)
}

// 引流
export const IS_GUIDE = [
    { value: 0, text: '无引流' },
    { value: 1, text: '同步新码' },
    { value: 2, text: '自定义二维码' }
]
export function getIsGuide(value) {
    return getExamine(IS_GUIDE, value)
}

// 红包类型
export const RED_PACKET_TYPE = [
    { value: 1, text: '固定金额' },
    { value: 2, text: '随机金额' },
    { value: 3, text: '阶梯金额' },
]
export function getRedPacketType(value) {
    return getExamine(RED_PACKET_TYPE, value)
}

// 订单状态
export const ORDER_STATUSES = [{
    text: '未付款',
    value: 1
}, {
    text: '已付款',
    value: 2
}, {
    text: '部分发货',
    value: 3
}, {
    text: '已发货',
    value: 4
}, {
    text: '交付中',
    value: 5
}, {
    text: '已完成',
    value: 6
}, {
    text: '已关闭',
    value: 7
}, {
    text: '已退款',
    value: 8
}]

export const ORDER_SYNC_STATUSES = {
    'complete': 6,
    'closed': 7
}

export function getOrderStatusText(value) {
    return getExamine(ORDER_STATUSES, value)
}

// 拒绝原因
export const BATCH_CAUSE = [
    { value: 0, text: '您上传的图片不够清晰' },
    { value: 1, text: '您的订单未全部好评' },
    { value: 2, text: '退货退款的订单不可以参加活动' },
]
export function getBatchCauseType(value) {
    return getExamine(BATCH_CAUSE, value)
}

// 订单来源
export const ORDER_FORMS = [{
    text: '自动同步',
    value: 1
}, {
    text: '文件导入',
    value: 2
}]
export function getOrderFormText(value) {
    return getExamine(ORDER_FORMS, value)
}

// 平台类型
export const SHOP_TYPES = [{
    text: '淘宝',
    value: 2
}, {
    text: '天猫',
    value: 3
}]

export function getShopTypeText(value) {
    return getExamine(SHOP_TYPES, value)
}

// 获取审核列表
export async function listData(params) {
    return request(`${Helper.format(api.listData.url)}?${stringify(params)}`)
}

// 获取活动详情
export function activitiesDetail(id) {
    return request(format(api.activitiesDetail.url, { id }))
}

// 获取订单详情
export function orderDetail(id) {
    return request(format(api.orderDetail.url, { id }))
}

// 通过
export async function pass(params) {
    return request(Helper.format(api.pass.url, { id: params.id }), {
        method: api.pass.type,
        body: params,
    })
}

// 拒绝
export async function reject(params) {
    return request(Helper.format(api.reject.url, { id: params.id }), {
        method: api.reject.type,
        body: params,
    })
}

// 确认
export async function confirm(params) {
    return request(format(api.confirm.url, { id: params.id }), {
        method: api.confirm.type,
        body: params,
    })
}

// 删除
export async function remove(params) {
    return request(format(api.remove.url, { id: params.id }), {
        method: api.remove.type,
        body: params,
    })
}

// 审核详情
export function reviewsDetail(id) {
    return request(format(api.reviewsDetail.url, { id }))
}

// 付款失败详情
export async function failPaymentDetail(params) {
    return request(`${Helper.format(api.failPaymentDetail.url)}?${stringify(params)}`)
}

// 批量通过
export async function batchPass(params) {
    return request(api.batchPass.url, {
        method: api.batchPass.type,
        body: params,
    })
}

export async function batchReject(params) {
    return request(api.batchReject.url, {
        method: api.batchReject.type,
        body: params,
    })
}

// 批量确认
export async function batchDelete(params) {
    return request(api.batchDelete.url, {
        method: api.batchDelete.type,
        body: params,
    })
}

export async function batchConfirm(params) {
    return request(api.batchConfirm.url, {
        method: api.batchConfirm.type,
        body: params,
    })
}

// 多个店铺对应信息
export async function activity_shops(params) {
    return request(`${api.activity_shops.url}?${stringify(params)}`)
}

// 同步订单
export function sync_order(id) {
    return request(format(api.sync_order.url, { id }))
}