import request from 'wx/utils/request'
import qs from 'qs'
import API from 'wx/common/api/friends/pass'

export async function list(params) {
    return request(`${API.list.url}?${qs.stringify(params)}`)
}
