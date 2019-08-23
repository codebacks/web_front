/*
 * @Author: sunlzhi 
 * @Date: 2018-10-20 19:28:28 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-10-26 16:35:12
 */

// import {stringify} from 'qs'
import request from 'mall/utils/request'
import api from 'mall/common/api/add_good'
import Helper from 'mall/utils/helper'


export async function getGoods(params) {
    return request(Helper.format(api.getGoods.url, {id: params.id}))
}

export async function createGoods(params) {
    return request(
        Helper.format(api.createGoods.url),
        {
            method:api.createGoods.type,
            body: params, 
        }
    )
}

export async function modifyGoods(params) {
    return request(
        Helper.format(api.modifyGoods.url, {id: params.id}),
        {
            method:api.modifyGoods.type,
            body: params, 
        }
    )
}

export async function getCategory(params) {
    return request(`${api.getCategory.url}`)
}

export async function getPostage(params) {
    return request(`${api.getPostage.url}`)
}
