import request from 'utils/request'
import qs from 'qs'
// import Helper from 'utils/helper'
import API from 'common/api/wechats'

export async function queryAll() {
    return request(API.all.url)
}

export async function querySummary(params) {
    return request(`${API.summary.url}?${qs.stringify(params)}`)
}

export async function queryPart(params) {
    return request(`${API.part.url}?${qs.stringify(params)}`)
}

export async function queryGroup(params) {
    return request(`${API.group.url}?${qs.stringify(params)}`)
}

export async function friends(payload) {
    return request(`${API.friends.url}?${qs.stringify(payload.params)}`)
}

// export async function query(payload) {
//     return request(`${Helper.format(API.list.url)}?${qs.stringify(payload)}`)
// }

// export async function result(payload) {
//     return request(`${Helper.format(API.RESULT.url)}?${qs.stringify(payload.params)}`)
// }
//
// export async function login(payload) {
//     return request(`${Helper.format(API.LOGIN.url)}?${qs.stringify(payload.params)}`)
// }
//

// export async function sessions(payload) {
//     return request(`${Helper.format(API.SESSIONS.url)}?${qs.stringify(payload)}`)
// }
//
// export async function stat(payload) {
//     return request(`${Helper.format(API.STAT.url)}?${qs.stringify(payload)}`)
// }
//
// export async function messages(payload) {
//     return request(`${Helper.format(API.MESSAGES.url, {uin: payload.from_uin})}?${qs.stringify(payload)}`)
// }
//
// export async function remove(params) {
//     return request(Helper.format(API.remove.url, {id: params.id}), {
//         method: API.remove.type,
//         body: params,
//     })
// }
//
// export async function update(payload) {
//     return request(Helper.format(API.update.url, {id: payload.username}), {
//         method: API.update.type,
//         body: payload.body
//     })
// }
//
// export async function queryHistory(params) {
//     return request(`${Helper.format(API.MESSAGES_HISTORY.url)}?${qs.stringify(params)}`)
// }
