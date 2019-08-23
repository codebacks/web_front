/**
 **@Description:
 **@author:吴明
 */

import {stringify} from 'qs'
import request from 'platform/utils/request'
import api from 'platform/common/api/redpacket'
import Helper from 'platform/utils/helper'


export async function tableList(params) {
    return request(Helper.format(api.tableList.url +"?"+ stringify(params)))
}

export async function checkPacket(params) {
    return request(Helper.format(api.checkPacket.url+'?'+stringify(params)))
}

export async function shopList(params) {
    return request(Helper.format(api.shopList.url+'?'+stringify(params)))
}