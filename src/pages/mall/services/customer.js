/**
 **@Description:
 **@author:吴明
 */

import {stringify} from 'qs'
import request from 'mall/utils/request'
import api from 'mall/common/api/customer'
import Helper from 'mall/utils/helper'


export async function customerList(params) {
    return request(Helper.format(api.customerList.url +"?"+ stringify(params)),null,{returnResponse:true})
}
export async function editName(params) {
    return request(
        Helper.format(api.editName.url +"?"+ stringify(params), {id: params.id}),
        {
            method:api.editName.type
        }
    )
}
export async function customerOrderList(params) {
    return request( Helper.format(api.customerOrderList.url +"?"+ stringify(params), {id: params.id}),null,{returnResponse:true})
}