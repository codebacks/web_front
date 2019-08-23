/**
 **@Description: 店铺商品接口
 **@author: zhousong
 */

import request from 'setting/utils/request'
import api from 'setting/common/api/shopGoods'
import { stringify } from 'qs'

//获取权限店铺列表
export async function getShopListOauth(params) {
    return request(`${api.getShopListOauth.url}`)
}

export async function getGoodsList(params) {
    return request(`${api.getGoodsList.url}?${stringify(params)}`)
}

export async function updateGoods(params) {
    return request(`${api.updateGoods.url}`,{
        method: api.updateGoods.type,
        body: params
    })
}



export async function getImportList(params) {
    return request(api.getImportList.url)
}
export async function importGoods(params) {
    return request(`${api.importGoods.url}`,{
        method: api.importGoods.type,
        body: params
    })
}
