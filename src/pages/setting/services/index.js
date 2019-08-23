/**
 **@Description:
 **@author: leo
 */

import {stringify} from 'qs'
import request from 'setting/utils/request'
import api from 'setting/common/api'

export async function querySiderMenu(params) {
    return request(`${api.querySiderMenu.url}?${stringify(params)}`)
}

export async function create(params) {
    return request(api.create.url, {
        method: api.create.type,
        body: params,
    })
}

