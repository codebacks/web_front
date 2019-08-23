// getLotteryActivitiesList,getLotteryActivities,postLotteryActivities,getLotteryRocordList,putLotteryRocord,activitiesDown,getActivitiesStat


import { stringify } from 'qs'
import request from '@/utils/request'
import api from '../common/api/lottery_activity'
import { format } from 'utils'

export async function getLotteryActivitiesList(params) {
    return request(`${api.getLotteryActivitiesList.url}?${stringify(params)}`)
}

export async function getLotteryActivities(params) {
    return request(format(api.getLotteryActivities.url, params))
}

export async function postLotteryActivities(params) {
    return request(api.postLotteryActivities.url, {
        method: api.postLotteryActivities.type,
        body: params,
    })
}


export async function putLotteryActivities(params) {
    return request(format(api.putLotteryActivities.url, {id:params.id}), {
        method: api.putLotteryActivities.type,
        body: params,
    })
}

export async function getLotteryRocordList(params) {
    return request(`${api.getLotteryRocordList.url}?${stringify(params)}`)
}

export async function getLotteryRocord(params) {
    return request(format(api.getLotteryRocord.url, params))
}

export async function putLotteryRocord(params) {
    return request(format(api.putLotteryRocord.url, {id:params.id}), {
        method: api.putLotteryRocord.type,
        body: params,
    })
}

export async function activitiesDown(params) {
    return request(format(api.activitiesDown.url, params), {
        method: api.activitiesDown.type,
        body: params,
    })
}

export async function deleteLotteryActivities(params) {
    return request(format(api.deleteLotteryActivities.url, params), {
        method: api.deleteLotteryActivities.type
    })
}

export async function getActivitiesStat(params) {
    return request(format(api.getActivitiesStat.url, params))
}

export function getQrCodeUrl(id) {
    return `${api.qrcodePrefixUrl}${format(api.getQrCode.url, {id})}`
}

export async function sendGrant(params) {
    return request(format(api.sendGrant.url, {id:params.id}), {
        method: api.sendGrant.type,
        body: params,
    })
}

//活动状态
export const ACTIVIT_STATUS = [
    { value: 1, text: '未开始' },
    { value: 2, text: '进行中' },
    { value: 3, text: '已结束' },
]

export const ACTIVIT_TYPE = [
    { value: 1, label: '积分' },
    { value: 2, label: '实物' },
    { value: 3, label: '现金红包' },
    { value: 4, label: '谢谢参与' },
]


export const LOTTEY_SEND_TYPE=[
    { value: 1, label: '未发放/未领取' },
    { value: 2, label: '领取成功' },
    { value: 4, label: '领取失败' },
    { value: 5, label: '发放中' },
    { value: 6, label: '已发放' },
]
