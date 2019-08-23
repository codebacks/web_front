import qs from 'qs'
import request from 'utils/request'
import API from 'common/api/device'

export async function queryPart(params) {
    return request(`${API.part.url}?${qs.stringify(params)}`)
}

export async function queryGroup(params) {
    return request(`${API.group.url}?${qs.stringify(params)}`)
}
