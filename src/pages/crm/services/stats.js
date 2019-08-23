import request from '../utils/request'
import Helper from '../utils/helper'
import API from 'crm/common/api/stats'
import qs from 'qs'

export async function queryWorkload(payload) {
    return request(`${Helper.format(API.WORKLOAD.url)}?${qs.stringify(payload.params)}`)
}
