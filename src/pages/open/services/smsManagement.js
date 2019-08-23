import qs from 'qs'
import request from '../utils/request'
import Helper from '../utils/helper'
import API from 'platform/common/api/smsManagement'



export async function getMsmTemplateList(params) {
    return request(`${API.getMsmTemplateList.url}?${qs.stringify(params)}`)
}

export async function getMsmTemplateDatail(params) {
    return request(`${API.getMsmTemplateDatail.url + params}`)
}

export async function postMsmTemplate(params) {
    return request(Helper.format(API.postMsmTemplate.url), {
        method: API.postMsmTemplate.type,
        body: params
    })
}

export async function qrcodes(params) {
    return request(`${API.qrcodes.url}?${qs.stringify(params)}`)
}
export async function putMsmTemplate(params) {
    return request(Helper.format(API.putMsmTemplate.url+params.id), {
        method: API.putMsmTemplate.type,
        body: params
    })
}


export async function deleteMsmTemplate(params) {
    return request(Helper.format(API.deleteMsmTemplate.url+params), {
        method: API.deleteMsmTemplate.type,
        // body: params
    })
}