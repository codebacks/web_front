/**
 **@Description:
 **@author:吴明
 */

import {stringify} from 'qs'
import request from 'mall/utils/request'
import api from 'mall/common/api/account'
import Helper from 'mall/utils/helper'

export async function accountList(params) {
    return request(Helper.format(api.accountList.url+"?"+ stringify(params)),null,{returnResponse:true})
}
export async function accountDetailList(params) {
    return request(Helper.format(api.accountDetailList.url+'?'+stringify(params),{id:params.id}),null,{returnResponse:true})
}
export async function accountDetail(params) {
    return request(Helper.format(api.accountDetail.url,{id:params.id}))
}
export async function getSeventIncome(params) {
    return request(Helper.format(api.getSeventIncome.url+"?"+ stringify(params)))
}