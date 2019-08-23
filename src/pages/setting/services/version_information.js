import {stringify} from 'qs'
import request from 'setting/utils/request'
import api from 'setting/common/api/version_information'
import Helper from 'utils/helper'

export  async function currentVersion(params){
    return request(`${api.currentVersion.url}`)
}
export  async function createVersionOrder(params){
    return request(`${api.createVersionOrder.url}`,{
        method:api.createVersionOrder.type,
        body:params
    })
}
export  async function phoneInfo(params){
    return request(`${api.phoneList.url}`)
}

export async function queryPayStatus(params) {
    return request(Helper.format(api.queryPayStatus.url,{id: params.id}))
}
export async function queryOrderStatus(params) {
    return request(Helper.format(api.queryOrderStatus.url,{id: params.id}))
}

export  async function upgradeVersionCharge(params){
    return request(`${api.upgradeVersionCharge.url}`,{
        method:api.upgradeVersionCharge.type,
        body:params
    })
}