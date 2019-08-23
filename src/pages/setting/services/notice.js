/**
 **@Description:
 **@author: yecuilin
 */

import {stringify} from 'qs'
import request from 'setting/utils/request'
import api from 'setting/common/api/notice'
import Helper from 'utils/helper'
import { format } from 'utils'

export async function getNoticeList(params) {
    return request(`${api.getNoticeList.url}?${stringify(params)}`)
}

export async function setReadStatus(params) {
    return request(format(api.setReadStatus.url, { id: params.id }), {
        method: api.setReadStatus.type,
        body: params,
    })
}

export async function getNoticeDetail(params) {
    return request(Helper.format(api.getNoticeDetail.url, {id: params.id})) 
}
