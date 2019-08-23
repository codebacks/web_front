import request from 'crm/utils/request'
import Helper from 'crm/utils/helper'
import api from 'crm/common/api/customerPool'
import {stringify} from 'qs'

export async function userPoolList(params) {
    return request(`${Helper.format(api.userPoolList.url)}?${stringify(params)}`)
}
export async function importList(params) {
    return request(`${Helper.format(api.importList.url)}?${stringify(params)}`)
}
export async function getUploadToken(params) {
    return request(`${Helper.format(api.getUploadToken.url)}?${stringify(params)}`)
}
export async function smsCount(params) {
    return request(`${Helper.format(api.smsCount.url)}?${stringify(params)}`)
}
export async function filterUserPool(params) {
    return request(`${Helper.format(api.filterUserPool.url)}?${stringify(params)}`)
}
export async function getShopList(params) {
    return request(`${Helper.format(api.getShopList.url)}?${stringify(params)}`)
}
export async function smsModelList(params) {
    return request(`${Helper.format(api.smsModelList.url)}?${stringify(params)}`)
}
export async function smsSignatureList(params) {
    return request(`${Helper.format(api.smsSignatureList.url)}?${stringify(params)}`)
}
export async function editRemark(params) {
    return request(Helper.format(api.editRemark.url+'?'+stringify(params), {id: params.id}), {
        method: api.editRemark.type,
        body: params
    })
}
export async function errorList(params) {
    return request(Helper.format(api.errorList.url+'?'+stringify(params), {id: params.import_history_id}))
}
export async function exportErrorList(params) {
    return request(Helper.format(api.exportErrorList.url, {id: params.id}))
}
export async function importData(params) {
    return request(Helper.format(api.importData.url+'?'+stringify(params)), {
        method: api.importData.type,
        body: params
    })
}
export async function sendSms(params) {
    return request(Helper.format(api.sendSms.url), {
        method: api.sendSms.type,
        body: params
    })
}


