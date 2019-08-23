import qs from 'qs'
import request from 'crm/utils/request'
import Helper from 'crm/utils/helper'
import {stringify} from 'qs'
import API from '../common/api/vip'

export async function vipRankList(params) {
    return request(`${Helper.format(API.vipRankList.url)}?${qs.stringify(params)}`)
}

export async function vipRankAdd(params) {
    return request(API.vipRankAdd.url, {
        method: API.vipRankAdd.type,
        body: params,
    })
}

export async function vipRankUpdate(params) {
    return request(`${Helper.format(API.vipRankUpdate.url, {id: params.id})}`, {
        method: API.vipRankUpdate.type,
        body: params,
    })
}

export async function vipChanegStatus(params) {
    return request(`${Helper.format(API.vipChanegStatus.url, {id: params.id})}`, {
        method: API.vipChanegStatus.type,
        body: params,
    })
}

export async function vipRankDetail(params) {
    return request(`${Helper.format(API.vipRankDetail.url, {id: params.id})}?${stringify(params)}`)
}

export async function vipList(params) {
    return request(`${API.vipList.url}?${stringify(params)}`)
}

export async function vipListByUser(params) {
    return request(`${API.vipListByUser.url}?${stringify(params)}`)
}

export async function getUserList(params) {
    return request(`${API.getUserList.url}?${stringify(params)}`)
}

export async function getVipDetail(params) {
    return request(`${Helper.format(API.getVipDetail.url, {id: params.id})}?${stringify(params)}`)
}

export async function getOrderList(params) {
    return request(`${Helper.format(API.getOrderList.url, {id: params.id})}?${stringify(params)}`)
}

