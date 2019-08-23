import qs from 'qs'
import request from 'wx/utils/request'
import API from 'wx/common/api/friends/deleted'

export async function list(params) {
    return request(`${API.list.url}?${qs.stringify(params)}`)
}