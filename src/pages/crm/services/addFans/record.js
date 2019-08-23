import qs from 'qs'
import request from 'crm/utils/request'
import Helper from 'crm/utils/helper'
import API from 'crm/common/api/addFans/record'

export async function list(params) {
    return request(`${Helper.format(API.list.url)}?${qs.stringify(params)}`)
}

