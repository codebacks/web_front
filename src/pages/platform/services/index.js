/**
 **@Description:
 **@author: leo
 */

import {stringify} from 'qs'
import request from 'platform/utils/request'
// import {tableList} from '../common/api/base'
import api from 'platform/common/api'

export async function query(params) {
    return request(`${api.list.url}?${stringify(params)}`)
}
export async function tableList(params) {
    return request(`${api.tableList.url}?${stringify(params)}`)
}
export async function create(params) {
    return request(api.create.url, {
        method: api.create.type,
        body: params,
    })
}
// export async function tableList(params) {
//     return request(api.tableList.url, {
//         method: api.tableList.type,
//         body: params,
//     })
// }
