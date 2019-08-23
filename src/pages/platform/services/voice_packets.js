/**
 **@Description:
 **@author:吴明
 */

import {stringify} from 'qs'
import request from 'platform/utils/request'
import api from 'platform/common/api/voice_packets'
import Helper from 'platform/utils/helper'

export async function voicePacketsAccount(params) {
    return request(Helper.format(api.voicePacketsAccount.url))
}

export async function voicePacketsList(params) {
    return request(Helper.format(api.voicePacketsList.url +"?"+ stringify(params)))
}

export async function openAccount(params) {
    return request(Helper.format(api.openAccount.url),{
        method:api.openAccount.type,
        // body:params
    })
}

export async function recharge(params) {
    return request(Helper.format(api.recharge.url),{
        method: api.recharge.type,
        body: params,
    })
}
export async function rechargeStatus(params) {
    return request(Helper.format(api.rechargeStatus.url,{no:params.no}))
}

export async function shopList(params) {
    return request(Helper.format(api.shopList.url+'?'+stringify(params)))
}


export async function rechargeList(params) {
    return request(Helper.format(api.rechargeList.url+'?'+stringify(params)))
}
export async function settlements(params) {
    return request(Helper.format(api.settlements.url+'?'+stringify(params)))
}
export async function settlementsList(params) {
    return request(Helper.format(api.settlementsList.url+'?'+stringify(params)))
}
export async function downloadBill(params) {
    return request(Helper.format(api.downloadBill.url+'?'+stringify(params)))
}
export async function downloadDetail(params) {
    return request(Helper.format(api.downloadDetail.url+'?'+stringify(params)))
}

export async function checkFirstRecharge(params) {
    return request(Helper.format(api.checkFirstRecharge.url))
}