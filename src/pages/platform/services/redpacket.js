/**
 **@Description:
 **@author:吴明
 */

import {stringify} from 'qs'
import request from 'platform/utils/request'
import api from 'platform/common/api/redpacket'
import Helper from 'platform/utils/helper'
import _ from 'lodash'


export async function tableList(params) {
    return request(Helper.format(api.tableList.url +"?"+ stringify(params)))
}

export async function checkPacket(params) {
    return request(Helper.format(api.checkPacket.url+'?'+stringify(params)))
}

export async function shopList(params) {
    return request(Helper.format(api.shopList.url+'?'+stringify(params)))
}

export async function reportList(params) {
    return request(Helper.format(api.reportList.url+'?'+stringify(params)))
}

export async function report(params) {
    return request(Helper.format(api.report.url),{
        method: api.report.type,
        body: params,
    })
}

const getListItem =(data, val, getProps, returnProps) => { 
    const obj = _.find(data , c => c[getProps] === val)
    return obj && obj[returnProps]
}

export const STATUS = [
    { value: 1,name: '待领取'},
    { value: 2, name: '已领取' },
    { value: 3,name: '已过期' },
    { value: 4,name: '领取失败' },
]
export function getStatusByVal(val){
    const v = _.toInteger(val)
    return getListItem(STATUS, v, 'value', 'name')
}
