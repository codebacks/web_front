import { stringify } from 'qs'
import request from '../../../utils/request'
import api from '../common/api/first_binding'
import { format } from 'utils'
import _ from 'lodash'

function getfirstBinding(items, value) {
    const v = _.toInteger(value)
    const type = _.find(items, c => c.value === v)
    return type && type.text
}

//活动状态
export const ACTIVIT_STATUS = [
    { value: 1, text: '未开始' },
    { value: 2, text: '进行中' },
    { value: 3, text: '已结束' },
]

export function getActivitieStatus(value) {
    return getfirstBinding(ACTIVIT_STATUS, value)
}

//奖品类型
export const AWARD_TYPE = [
    { value: 1, text: '现金红包' },
    { value: 2, text: '抓娃娃游戏币' }
]

export function getAwardType(value) {
    return getfirstBinding(AWARD_TYPE, value)
}

//奖金类型 
export const PRICE_TYPE = [
    { value: 1, text: '固定金额' },
    { value: 2, text: '随机金额' }
]

export function getPriceType(value) {
    return getfirstBinding(PRICE_TYPE, value)
}

// 店铺类型
export const SHOP_TYPE = [
    { value: 2, text: '淘宝', name: 'TaoBao' },
    { value: 3, text: '天猫', name: 'TianMao' },
    { value: 5, text: '京东', name: 'JD' },
    { value: 6, text: '有赞', name: 'YouZan' },
]

export function getShopValByName(name, value) {
    return SHOP_TYPE.find(item => item.name === name, value)
}

// 活动列表
export async function listData(params) {
    return request(`${api.listData.url}?${stringify(params)}`)
}

//创建活动
export async function create(params) {
    return request(api.create.url, {
        method: api.create.type,
        body: params,
    })
}

//活动详情
export function activitiesDetail(activity_id) {
    return request(format(api.activitiesDetail.url, { activity_id }))
}

//删除活动
export async function remove(params) {
    return request(format(api.remove.url, { activity_id: params.id }), {
        method: api.remove.type,
        body: params,
    })
}

//编辑活动
export async function update(params) {
    return request(format(api.update.url, { activity_id: params.id }), {
        method: api.update.type,
        body: params,
    })
}

//活动下线
export async function downline(params) {
    return request(format(api.downline.url, { activity_id: params.id }), {
        method: api.downline.type,
        body: params,
    })
}

//数据统计
export async function graphicStatistics(params) {
    return request(format(`${api.graphicStatistics.url}?${stringify(params)}`, { activity_id: params.id }))
}

// 是否开通
export async function isOpen(params) {
    return request(`${api.isOpen.url}?${stringify(params)}`)
}

// 获取店铺列表
export async function shops(params) {
    return request(`${api.shops.url}?${stringify(params)}`)
}