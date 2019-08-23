/**
 **@time: 2018/8/9
 **@Description:支付设置接口
 **@author: wangchunting
 */

import { stringify } from 'qs'
import request from 'setting/utils/request'
import api from 'setting/common/api/pay'
import { format } from 'utils'

export async function payList(params) {
    return request(`${api.payList.url}?${stringify(params)}`)
}

export async function create(params) {
    return request(api.create.url, {
        method: api.create.type,
        body: params,
    })
}

export async function remove(params) {
    return request(format(api.remove.url, { id: params.id }), {
        method: api.remove.type,
        body: params,
    })
}

export async function update(params) {
    return request(format(api.update.url, { id: params.id }), {
        method: api.update.type,
        body: params,
    })
}

//获取七牛上传文件token
export async function getToken(params) {
    return request(`${api.getToken.url}?${stringify(params)}`)
}

export async function getEditModel(id){
    return request(format(api.getEditModel.url, {id}) )
}