/**
 **@Description:
 **@author: 吴明
 */

import {stringify} from 'qs'
import request from 'platform/utils/request'
import api from 'platform/common/api/qrcodeData'
import Helper from 'platform/utils/helper'

export async function qrcodeData(params) {
    return request(Helper.format(api.qrcodeData.url, {id: params.id,type:params.type}))    
}

export async function qrcodeWechat(params) {   
    return request(Helper.format(api.qrcodeWechat.url +"?"+ stringify(params), {id: params.id}))
}

export async function downloadExports(params) {
    return request(`${api.downloadExports.url}?${stringify(params)}`) 
}

export async function timeInterval(params) {
    return request(`${api.timeInterval.url}?${stringify(params)}`)   
}

