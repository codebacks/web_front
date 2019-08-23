import {stringify} from 'qs'
import request from '../utils/request'
import api from '../common/api/wxpublic_qrcode'
import Helper from 'utils/helper'

export async function qrcodeList(params) {
    return request(`${api.qrcodeList.url}?${stringify(params)}`)
}

export async function qrcodeDetail(params) {
    return request(Helper.format(api.qrcodeDetail.url, params))
}

export async function postQrcode(params) {
    return request(api.postQrcode.url, {
        method: api.postQrcode.type,
        body: params,
    })
}

export async function putQrcode(params) {
    return request(Helper.format(api.putQrcode.url,{id:params.id}), {
        method: api.putQrcode.type,
        body: params,
    })
}

export async function deleteQrcode(params) {
    return request(Helper.format(api.deleteQrcode.url,params), {
        method: api.deleteQrcode.type
    })
}

export async function recordQrcode(params) {
    return request(Helper.format(api.recordQrcode.url, params))
}

export const REPLY_TYPE = [{
    value: '1',
    text: '文字'
}, {
    value: '2',
    text: '图片'
}, {
    value: '3',
    text: '晒图活动'
}]
