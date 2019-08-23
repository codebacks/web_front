/**
 **@Description:
 **@author:吴明
 */

import {stringify} from 'qs'
import request from 'platform/utils/request'
import api from 'platform/common/api/packet_model'
import Helper from 'platform/utils/helper'


export async function createModel(params) {
    return request(Helper.format(api.createModel.url),{
        method: api.createModel.type,
        body: params,
    })
}
export async function modelList(params) {
    return request(Helper.format(api.createModel.url +"?"+ stringify(params)))
}
export async function deleteModel(params) {
    return request(Helper.format(api.deleteModel.url,{id: params.id}),{
        method: api.deleteModel.type,
        body: params,
    })
}
export async function editModel(params) {
    return request(Helper.format(api.editModel.url,{id: params.id}),{
        method: api.editModel.type,
        body: params,
    })
}
