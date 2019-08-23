/**
 **@Description:
 **@author:吴明
 */

import {stringify} from 'qs'
import request from 'platform/utils/request'
import api from 'platform/common/api/packet_limit'
import Apis from 'setting/common/api/roles'
import Helper from 'platform/utils/helper'


export async function roles(params) {
    return request(Helper.format(Apis.list.url))
}
export async function accountLimitList(params) {
    return request(Helper.format(api.accountLimitList.url + '?'+ stringify(params)))
}
export async function editAccountLimit(params) {
    return request(Helper.format(api.editAccountLimit.url),{
        method: api.editAccountLimit.type,
        body: params,
    })
}
