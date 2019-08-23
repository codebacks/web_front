import qs from 'qs'
import request from 'utils/request'
import API from 'common/api/tags'

export async function list(params) {
    return request(`${API.list.url}?${qs.stringify(params)}`)
}
