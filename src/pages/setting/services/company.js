/**
 **@Description:
 **@author: leo
 */

import {stringify} from 'qs'
import request from 'setting/utils/request'
import api from 'setting/common/api/company'

export async function update(params) {
    return request(api.update.url, {
        method: api.update.type,
        body: params,
    })
}

export async function detail(params) {
    return request(`${api.detail.url}?${stringify(params)}`)
}

