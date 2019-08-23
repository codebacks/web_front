import { stringify } from 'qs'
import request from '../../../utils/request'
import api from '../common/api/discount_coupon'
import Helper from 'mall/utils/helper'
import _ from 'lodash'


// 优惠券列表
export async function couponDataList(params){
    return request(`${Helper.format(api.couponDataList.url)}?${stringify(params)}`)
}


export async function checkDetail(params){
    return request(Helper.format(api.checkDetail.url, {id: params.id }))
}



// 商品列表
export async function goods(params) {
    return request(
        Helper.format(
            api.goods.url +"?"+ stringify(params)
        ),null,{returnResponse:true})
}

export async function createCoupon(params) {
    return request(
        Helper.format(api.createCoupon.url),
        {
            method:api.createCoupon.type,
            body: params, 
        }
    )
}



export async function solidOut(params){
    return request(
        Helper.format(api.solidOut.url,{id:params.id}),
        {
            method:api.solidOut.type,
            body: params, 
        }
    )
}


export async function putaway(params){
    return request(
        Helper.format(api.putaway.url,{id:params.id}),
        {
            method:api.putaway.type,
            body: params, 
        }
    )
}

export async function cancellation(params){
    return request(
        Helper.format(api.cancellation.url,{id:params.id}),
        {
            method:api.cancellation.type,
            body: params, 
        }
    )
}


export async function echartsData(params){
    return request(`${Helper.format(api.echartsData.url,{id:params.id})}?${stringify(params)}`)
}


export async function couponData(params){
    return request(`${Helper.format(api.couponData.url,{id:params.id})}?${stringify(params)}`)
}


export async function getgoodsList(params) {
    return request(Helper.format(api.getgoodsList.url,{id:params.id})+"?"+stringify(params),null,{returnResponse:true})
}


const getListItem =(data, val, getProps, returnProps) => { 
    const obj = _.find(data , c => c[getProps] === val)
    return obj && obj[returnProps]
}

//场景
export const STATUS_TYPE = [
    {value : '2',name :'可用'},
    {value : '3',name :'不可用'},
    {value : '11',name :'已下架'},
    {value : '12',name :'已作废'},
    {value : '1',name :'未开始'},
    {value : '10',name :'正常'},
    
]

export function getStatusTypeName(val){   
    return getListItem(STATUS_TYPE, val, 'name', 'value')
}
export function getStatusTypeVal(val){
    const v = _.toInteger(val)
    return getListItem(STATUS_TYPE, val, 'value', 'name')
}
