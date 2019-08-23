import { stringify } from 'qs'
import request from 'mall/utils/request'
import api from '../../common/api/distributor/distributor_management'
import { format } from 'utils'
 
export async function managementList(params) {
    return request(`${api.managementList.url}?${stringify(params)}`)
}

export async function update(params) {
    return request(format(api.update.url, { disstributor_id: params.disstributor_id }), {
        method: api.update.type,
        body: params,
    })
}