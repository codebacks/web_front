/**
 **@time: 2018/12/17
 **@Description:积分总览
 **@author: yecuilin
 */

 
import request from 'crm/utils/request'
import api from 'crm/common/api/integral'
import Helper from 'utils/helper'
import {format} from 'utils'
import qs from 'qs'
import _ from 'lodash'

const getListItem =(data, val, getProps, returnProps) => { 
    const obj = _.find(data , c => c[getProps] === val)
    return obj && obj[returnProps]
}

// 奖品类型
export const AWARD_TYPE = [
    { value: 1, type: '红包', name: 'HongBao' },
    { value: 2, type: '实物', name: 'ShiWu' },
]
export function getAwardValByName(val){
    return getListItem(AWARD_TYPE, val, 'name', 'value')
}
export function getAwardTypeByVal(val){
    const v = _.toInteger(val)
    return getListItem(AWARD_TYPE, v, 'value', 'type')
}

// 上架状态
export const AWARD_STATUS = [
    { value: 1, type: '上架', name: 'ShangJia' },
    { value: 2, type: '下架', name: 'XiaJia' },
]
export function getStatusValByName(val){
    return getListItem(AWARD_STATUS, val, 'name', 'value')
}
export function getStatusTypeByVal(val){
    const v = _.toInteger(val)
    return getListItem(AWARD_STATUS, v, 'value', 'type')
}

// 红包状态
export const PACKET_STATUS = [
    { value: 1, type: '待领取', status: 'processing' },
    { value: 2, type: '已领取', status: 'success'  },
    { value: 3, type: '已过期' , status: 'default' },
    { value: 4, type: '领取失败', status: 'default'  },
]
export function getPacketStatusTypeByVal(val){
    const v = _.toInteger(val)
    return getListItem(PACKET_STATUS, v, 'value', 'type')
}
export function getPacketStatusStatusByVal(val){
    const v = _.toInteger(val)
    return getListItem(PACKET_STATUS, v, 'value', 'status')
}
// 平台类型
export const PLATFORM_TYPE = [
    { value: 1, type: '淘宝/天猫', name: 'TaoBao'},
    { value: 2, type: '京东', name: 'JD' },
    { value: 20, type: '有赞', name: 'YouZan' },
    { value: 21, type: '虎赞小店', name: 'HuZan' },
    { value: 99, type: '自营', name: 'ZiYing' }
]

// 实物状态
export const GOODS_STATUS = [
    { value: 1, type: '待发货', status: 'processing'  },
    { value: 2, type: '已发货', status: 'success'  },
    { value: 3, type: '已收货', status: 'default'  },
]
// 平台类型
export const SHOP_TYPE = [
    { value: 1, name: '虎赞小店'},
    { value: 2, name: '淘宝' },
    { value: 3, name: '天猫' },
    { value: 4, name: '门店' },
    { value: 5, name: '京东' },
    { value: 6, name: '有赞' },
    { value: 7, name: '自营' },
    { value: 9, name: '微商小店' },
]
export function getPlatformTypeByVal(val){
    const v = _.toInteger(val)
    return getListItem(SHOP_TYPE, v, 'value', 'name')
}

export function getGoodStatusTypeByVal(val){
    const v = _.toInteger(val)
    return getListItem(GOODS_STATUS, v, 'value', 'type')
}
export function getGoodStatusStatusByVal(val){
    const v = _.toInteger(val)
    return getListItem(GOODS_STATUS, v, 'value', 'status')
}


export async function getSummary() {
    return request(`${api.getSummary.url}`)
}
export async function searchSummaryList(params) {
    return request(`${api.searchSummaryList.url}?${qs.stringify(params)}`)
}
export async function searchPointsList(params) {
    return request(`${api.searchPointsList.url}?${qs.stringify(params)}`)
}
// 积分吗明细
export async function pointsListDetail(params) {
    return request(`${Helper.format(api.pointsListDetail.url,{id: params.point_id})}?${qs.stringify(params)}`)
}
//积分设置
export async function getsettingData() {
    return request(`${api.getsettingData.url}`)
}

//获取授权店铺getGzhList
export async function getAuthshops(params) {
    return request(`${api.getAuthshops.url}?${qs.stringify(params)}`)
}
// 获取公众号updateSetting
export async function getGzhList() {
    return request(`${api.getGzhList.url}`)
}
// 更新设置
export async function updateSetting(params) {
    return request(Helper.format(api.updateSetting.url),{
        method: api.updateSetting.type,
        body: params,
    })
}
// 导出记录exportReport
export async function exportReport() {
    return request(`${api.exportReport.url}`)
}


// 奖品列表
export async function getAwardList(params) {
    return request(`${api.getAwardList.url}?${qs.stringify(params)}`)
}

// 上架下架
export async function toggleAward(params) {
    return request(`${api.toggleAward.url}`,{
        method: api.toggleAward.type,
        body: params,
    })
}

// 删除
export async function deleteAward(params) {
    return request(`${api.deleteAward.url}`,{
        method: api.deleteAward.type,
        body: params,
    })
}

export async function getAwardDetail(params) {
    return request(`${Helper.format(api.getAwardDetail.url,{id: params.id})}`)
}

export async function editAward(params) {
    return request(`${api.editAward.url}`,{
        method: api.editAward.type,
        body: params,
    })
}



// 商城列表
export async function getMallList(params) {
    return request(`${api.getMallList.url}?${qs.stringify(params)}`)
}

// 商城详情
export async function getMallDetail(params) {
    return request(`${Helper.format(api.getMallDetail.url,{id: params.id})}`)
}

// 商城创建或编辑
export async function editMall(params) {
    return request(`${api.editMall.url}`,{
        method: api.editMall.type,
        body: params,
    })
}



// 获取兑换订单列表
export async function getExchangeList(params) {
    return request(`${api.getExchangeList.url}?${qs.stringify(params)}`)
}

// 导出订单记录
export async function exportOrder(params) {
    return request(`${api.exportOrder.url}?${qs.stringify(params)}`)
}

// 发货
export async function deliverGoods(params) {
    return request(`${Helper.format(api.deliverGoods.url,{id: params.id})}`,{
        method: api.deliverGoods.type,
        body: params,
    })
}

// 获取快递列表
export async function getExpressList(params) {
    return request(`${api.getExpressList.url}`)
}


// export  function getDownLoadApiUrl() {
//     return (`${Helper.format(api.getDownLoadApiUrl.url)}`)
// }

// export async function downLoad(params) {
//     return request(`${Helper.format(api.downLoad.url,{id: params.id})}?${qs.stringify(params)}`)
// }

// export async function getShortUrl(params) {
//     return request(`${Helper.format(api.getShortUrl.url,{id: params.id})}`)
// }

// 修改积分
export async function changeIntegral(params) {
    return request(format(api.changeIntegral.url,{id: params.id}), {
        method: api.changeIntegral.type,
        body: params,
    })
}
