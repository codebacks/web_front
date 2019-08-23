/*
 * @Author: sunlzhi 
 * @Date: 2018-11-16 14:36:12 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-11-19 17:22:22
 */

import {stringify} from 'qs'
import Helper from 'data/utils/helper'
import request from 'data/utils/request'
import api from '../../common/api/customer_group'

export async function userGroupings(params) {
    return request(`${api.userGroupings.url}`)
}

export async function addGroup(params) {
    return request(api.addGroup.url, {
        method: api.addGroup.type,
        body: params,
    })
}

export async function deleteGroupings(params) {
    return request(Helper.format(api.deleteGroupings.url, {user_grouping_id: params.id}), {
        method: api.deleteGroupings.type,
        body: params,
    })
}

export async function customerList(params) {
    return request(Helper.format(`${api.customerList.url}?${stringify(params)}`, {user_grouping_id: params.id}))
}
