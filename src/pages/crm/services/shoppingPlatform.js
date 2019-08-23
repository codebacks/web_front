import request from 'crm/utils/request'
import api from 'crm/common/api/shoppingPlatform'
import {format} from 'utils'
import qs from 'qs'

export async function members(params) {
    return request(`${format(api.members.url)}?${qs.stringify(params)}`)
}
