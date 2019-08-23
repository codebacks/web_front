import request from '../utils/request'
import api from '../common/api/blueprint'
import { stringify } from 'qs'
import _ from 'lodash'

function getExamine(items, value) {
    const v = _.toInteger(value)
    const type = _.find(items, c => c.value === v)
    return type && type.text
}
export function getPayStatus(value) {
    return getExamine(SUBJECT_TYPE, value)
}

export const SUBJECT_TYPE = {
    blueprint:2
}


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