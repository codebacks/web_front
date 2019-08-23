/**
 **@Description:
 **@author: AmberYe
 */

import request from 'platform/utils/request'
import api from 'platform/common/api/wxcodelist'
import Helper from 'utils/helper'
import qs from 'qs'
export async function query(params) {
    return request(`${Helper.format(api.getwxList.url)}?${qs.stringify(params)}`)
}

export  function getDownLoadApiUrl() {
    return (`${Helper.format(api.getDownLoadApiUrl.url)}`)
}

export async function downLoad(params) {
    return request(`${Helper.format(api.downLoad.url,{id: params.id})}?${qs.stringify(params)}`)
}

export async function getShortUrl(params) {
    return request(`${Helper.format(api.getShortUrl.url,{id: params.id})}`)
}


