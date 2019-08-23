/**
 **@Description:
 **@author:吴明
 */

import {stringify} from 'qs'
import request from 'mall/utils/request'
import api from 'mall/common/api/carriage'
import Helper from 'mall/utils/helper'


export async function tableList(params) {
    return request(Helper.format(api.tableList.url +"?"+ stringify(params)))
}

export async function checkPacket(params) {
    return request(Helper.format(api.checkPacket.url+'?'+stringify(params)))
}

export async function shopList(params) {
    return request(Helper.format(api.shopList.url+'?'+stringify(params)))
}

export async function carriageTemplateList(params){
    return request(Helper.format(api.getCarriageTemplateListOrDetail.url+'?'+stringify(params)),null,{returnResponse:true})
}

export async function carriageTemplateDetail(params){
    return request(Helper.format(api.getCarriageTemplateListOrDetail.url +'/'+ params))
}
export async function increaseCarriageTemplate(params) {
    return request(api.increaseCarriageTemplate.url, {
        method: api.increaseCarriageTemplate.type,
        body: params,
    })
}

export async function updateCarriageTemplate(params) {
    return request(api.updateCarriageTemplate.url + params.id, {
        method: api.updateCarriageTemplate.type,
        body: params.params,
    })
}
export async function deleteCarriageTemplate(params) {
    return request(api.deleteCarriageTemplate.url + params, {
        method: api.deleteCarriageTemplate.type,
        body: params.params,
    })
}


export async function putPostageType(params) {
    return request(api.putPostageType.url, {
        method: api.putPostageType.type,
        body:params
    })
}