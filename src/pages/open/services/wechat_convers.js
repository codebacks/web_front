/**
 **@Description: 店铺商品接口
 **@author: zhousong
 */

import request from '../utils/request'
import api from '../common/api/wechat_convers'
import { stringify } from 'qs'
import Helper from 'utils/helper'

//获取权限店铺列表
export async function getShopListOauth() {
    return request(`${api.getShopListOauth.url}`)
}

export async function getGoodsList(params) {
    return request(`${api.getGoodsList.url}?${stringify(params)}`)
}

export async function getLinkList(params) {
    return request(`${api.getLinkList.url}?${stringify(params)}`)
}

export async function oneClickSetAll() {
    return request(`${api.oneClickSetAll.url}`, {method: api.oneClickSetAll.type})
}

export async function setWetoTao(number) {
    return request(`${api.setWetoTao.url}/${number}`, { method: api.setWetoTao.type })
}

export async function goodsDeleteWe(number) {
    return request(`${api.goodsDeleteWe.url}/${number}`, { method: api.goodsDeleteWe.type })
}

export async function deleteWe(id) {
    return request(`${api.deleteWe.url}/${id}`, { method: api.deleteWe.type })
}




// 商品详情
export async function getGoodItemInfo(params) {
    return request(`${Helper.format(api.getGoodItemInfo.url,{id: params.id})}`)
}


// 30天商品推荐数据信息
export async function getGoodsrecommendInfo(params) {
    return request(`${Helper.format(api.getGoodsrecommendInfo.url,{id: params.id})}`)
}
//发送记录
export async function getsendDatalist(params) {
    return request(`${Helper.format(api.getsendDatalist.url,{id: params.id})}?${stringify(params)}`)
    // return request(`${api.getsendDatalist.url}?${stringify(params)}`)
}