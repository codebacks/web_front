import request from 'utils/request'
// import Helper from 'utils/helper'
import API from 'common/api/users'
import qs from 'qs'

export async function querySub(params) {
    return request(`${API.sub.url}?${qs.stringify(params)}`)
}

export async function querySummary(params) {
    return request(`${API.summary.url}?${qs.stringify(params)}`)
}

export async function query(params) {
    return request(`${API.list.url}?${qs.stringify(params)}`)
}

export async function queryAll(params) {
    return request(`${API.CHILDREN.url}?${qs.stringify(params)}`)
}

export async function queryUsersByCompany(params) {
    return request(`${API.QUERY_BY_COMPANY.url}?${qs.stringify(params)}`)
}

export async function updateMe(params) {
    return request(API.updateMe.url, {
        method: API.updateMe.type,
        body: params,
    })
}

export async function updatePassword(params) {
    return request(API.UPDATE_PASSWORD.url, {
        method: API.UPDATE_PASSWORD.type,
        body: params,
    })
}

export async function verifyMe(params) {
    return request(API.verifyMe.url, {
        method: API.verifyMe.type,
        body: params,
    })
}

export async function changeMobile(params) {
    return request(API.changeMobile.url, {
        method: API.changeMobile.type,
        body: params,
    })
}

export async function findPassword(params) {
    return request(API.findPassword.url, {
        method: API.findPassword.type,
        body: params,
    })
}

