import { stringify } from 'qs'
import request from '../../../utils/request'
import api from '../common/api/first_binding_record'
import first from '../common/api/first_binding'

import _ from 'lodash'

function getfirstBinding(items, value) {
    const v = _.toInteger(value)
    const type = _.find(items, c => c.value === v)
    return type && type.text
}

//活动状态
export const RECEIVE_STATUS = [
    { value: 1, text: '未领取' },
    { value: 2, text: '领取失败' },
    { value: 3, text: '已领取' },
    { value: 4, text: '已过期' },
]
export function getActivitieStatus(value) {
    return getfirstBinding(RECEIVE_STATUS, value)
}

export const PLATFORM_ID = [
    { value: 1, text: '淘宝/天猫' },
    { value: 2, text: '京东' },
    { value: 20, text: '有赞' },
]
export function getPlatformType(value) {
    return getfirstBinding(PLATFORM_ID, value)
}

// 活动名称强制拉取已删除的数据
export const FORCE = {
    force: 1
}

export async function firstListData(params) {
    return request(`${api.listData.url}?${stringify(params)}`)
}

// 活动列表
export async function listData(params) {
    return request(`${first.listData.url}?${stringify(params)}`)
}
