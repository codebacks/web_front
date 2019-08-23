import request from 'data/utils/request'
import api from 'data/common/api/packetAccounts'
import { stringify } from 'qs'

export async function getTableList(params) {
    return request(`${api.getTableList.url}?${stringify(params)}`)
}

export async function getMchNo(params) {
    return request(`${api.getMchNo.url}?${stringify(params)}`)
}

export async function accountsDownLoad(params) {
    return request(`${api.accountsDownLoad.url}?${stringify(params)}`)
}

export async function accountsDetailDownLoad(params) {
    return request(`${api.accountsDetailDownLoad.url}?${stringify(params)}`)
}
export async function downLoadDetail(params) {
    return request(`${api.downLoadDetail.url}?${stringify(params)}`)
}
export async function createDetailRecords(params) {
    return request(`${api.createDetailRecords.url}?${stringify(params)}`)
}
