import request from 'community/utils/request'
import qs from 'qs'
import API from 'community/common/api/friends/pass'

export async function list(params) {
    return request(`${API.list.url}?${qs.stringify(params)}`)
}
