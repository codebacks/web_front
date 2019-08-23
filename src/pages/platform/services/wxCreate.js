/**
 **@Description:
 **@author: AmberYe
 */

import request from 'platform/utils/request'
import api from 'platform/common/api/wxcodelist'
import Helper from 'utils/helper'
import qs from 'qs'
export async function wxdetail(params) {
    return request(Helper.format(api.getCreateObj.url, {id: params.id}))   
}

export async function getWxlistData(params) {
    return request(`${Helper.format(api.getWxlistData.url,{id: params.id})}?${qs.stringify(params)}`)
}

export async function getWxlistDataNoId(params) {
    return request(`${Helper.format(api.getWxlistDataNoId.url)}?${qs.stringify(params)}`)
}

export async function deleteWx(params) {
    return request(Helper.format(api.deleteWx.url,{qr_id: params.qrcode_id,wx_id: params.wechat_id,sign:params.sign}),{
        method: api.deleteWx.type,
        body: params,
    })
}

export async function updateCreateObj(params) {
    return request(Helper.format(api.updateCreateObj.url,{id:params.id}),{
        method: api.updateCreateObj.type,
        body: params,
    })
}

export async function createWxcode(params) {
    return request(Helper.format(api.createWxcode.url),{
        method: api.createWxcode.type,
        body: params,
    })
}


export async function uploadBg(params) {
    return request(`${Helper.format(api.uploadBg.url)}?${qs.stringify(params)}`)
}

export async function cancleCreate() {
    return request(Helper.format(api.cancleCreate.url),{
        method: api.cancleCreate.type
    })
}

export async function addWxNum(params) {
    return request(Helper.format(api.addWxNum.url),{
        method: api.addWxNum.type,
        header:{
            'Content-Type':'application/json'
        },
        body: params
    })
}