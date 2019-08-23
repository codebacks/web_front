import qs from 'qs'
import request from 'community/utils/request'
import API from 'community/common/api/keyword/management'

export async function list(params) {
    return request(`${API.list.url}?${qs.stringify(params)}`)
}
