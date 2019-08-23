import {stringify} from 'qs'
import request from '../utils/request'
import api from '../common/api/attention_prize'
import Helper from 'utils/helper'

export async function attentionPrizeList(params) {
    return request(`${api.attentionPrizeList.url}?${stringify(params)}`)
}


export async function postAttentionPrize(params) {
    return request(api.postAttentionPrize.url, {
        method: api.postAttentionPrize.type,
        body: params,
    })
}

export async function putAttentionPrize(params) {
    return request(Helper.format(api.putAttentionPrize.url,{id:params.id}), {
        method: api.putAttentionPrize.type,
        body: params,
    })
}
export async function createQrcode(params) {
    return request(Helper.format(api.createQrcode.url,{id:params.id}), {
        method: api.createQrcode.type,
        body: params,
    })
}
export async function deleteAttentionPrize(params) {
    return request(Helper.format(api.deleteAttentionPrize.url,params), {
        method: api.deleteAttentionPrize.type
    })
}

export async function attentionPrizeDetail(params) {
    return request(Helper.format(api.attentionPrizeDetail.url, params))
}

export async function recordAttentionPrize(params) {
    return request(Helper.format(api.recordAttentionPrize.url, params))
}
