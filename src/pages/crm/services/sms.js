import qs from 'qs'
import request from '../utils/request'
import Helper from '../utils/helper'
import API from 'crm/common/api/sms'


export async function queryConfig(params) {
    return request(`${API.CONFIG.url}?${qs.stringify(params)}`)
}

export async function queryTasks(params) {
    return request(`${API.TASKS.url}?${qs.stringify(params)}`)
}

export async function queryHistory(params) {
    return request(`${Helper.format(API.TASKS_DETAIL.url, {id: params.id})}?${qs.stringify(params)}`)
}

export async function setConfig(params) {
    return request(Helper.format(API.SET_CONFIG.url), {
        method: API.SET_CONFIG.type,
        body: params
    })
}


export async function queryTemplates(params) {
    return request(`${API.TEMPLATES.url}?${qs.stringify(params)}`)
}


export async function createTemplate(payload) {
    return request(API.CREATE_TEMPLATE.url, {
        method: API.CREATE_TEMPLATE.type,
        body: payload
    })
}

export async function send(payload) {
    return request(API.SEND.url, {
        method: API.SEND.type,
        body: payload
    })
}


export async function updateTemplate(payload) {
    return request(Helper.format(API.UPDATE_TEMPLATE.url, {id: payload.id}), {
        method: API.UPDATE_TEMPLATE.type,
        body: payload
    })
}

export async function removeTemplate(params) {
    return request(Helper.format(API.DELETE_TEMPLATE.url, {id: params.id}), {
        method: API.DELETE_TEMPLATE.type,
        body: params,
    })
}

export async function updatePassword(params) {
    return request(Helper.format(API.UPDATE_PASSWORD.url), {
        method: API.UPDATE_PASSWORD.type,
        body: params
    })
}

export async function queryUserByCompany(params) {
    return request(`${API.QUERY_BY_COMPANY.url}?${qs.stringify(params)}`)
}

export async function createTask(params) {
    return request(API.CREATE_TASK.url, {
        method: API.CREATE_TASK.type,
        body: params
    })
}


export async function querySign(params) {
    return request(`${API.SIGNS.url}?${qs.stringify(params)}`)
}

export async function queryStoreSign(params) {
    return request(`${API.STORE_SIGNS.url}?${qs.stringify(params)}`)
}

export async function queryDateUsed(params) {
    return request(`${API.DATE_USED.url}?${qs.stringify(params)}`)
}


export async function createSign(payload) {
    return request(API.CREATE_SIGN.url, {
        method: API.CREATE_SIGN.type,
        body: payload
    })
}

export async function removeSign(params) {
    return request(Helper.format(API.DELETE_SIGN.url, {id: params.id}), {
        method: API.DELETE_SIGN.type,
        body: params,
    })
}