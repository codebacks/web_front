/*
 * @Author: sunlzhi 
 * @Date: 2018-10-16 15:15:14 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-10-22 15:15:17
 */

import {stringify} from 'qs'
import request from 'mall/utils/request'
import api from 'mall/common/api/goods_management'
import Helper from 'mall/utils/helper'
import { format } from 'utils'
import apiDistributorCenter from '../common/api/distributor/distributor_center'

export async function goodsList(params) {
    return request(Helper.format(api.goodsList.url +"?"+ stringify(params)),null,{returnResponse:true})
}

export async function goodsBatch(params) {
    return request(
        Helper.format(api.goodsBatch.url),
        {
            method:api.goodsBatch.type,
            body: params, 
        }
    )
}

export async function batchRecommend(params) {
    return request(
        Helper.format(api.batchRecommend.url),
        {
            method:api.batchRecommend.type,
            body: params, 
        }
    )
}

export async function batchDelete(params) {
    return request(
        Helper.format(api.batchDelete.url),
        {
            method:api.batchDelete.type,
            body: params, 
        }
    )
}

// 佣金比例设置
export async function commissionUpdate(params) {
    return request(
        Helper.format(api.commissionUpdate.url, {id: params.id}),
        {
            method:api.commissionUpdate.type,
            body: params, 
        }
    )
}

export async function updateVirtualSales(params) {
    return request(
        Helper.format(api.updateVirtualSales.url, {id: params.id}),
        {
            method:api.updateVirtualSales.type,
            body: params, 
        }
    )
}

// 分销员商家信息
export async function centerList(params) {
    return request(format(apiDistributorCenter.centerList.url, { params }))
}

// 批量导入商品部分
export async function getPlatformShops(params) {
    return request(`${api.getPlatformShops.url}?${stringify(params)}`)
}

export async function getCategory(params) {
    return request(`${api.getCategory.url}${params.shop_id}/categories?${stringify(params)}`)
}

export async function goodsBatchImport(params) {
    return request(
        Helper.format(api.goodsBatchImport.url),
        {
            method:api.goodsBatchImport.type,
            body: params, 
        },
        {returnResponse:true}
    )
}
