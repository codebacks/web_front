import qs from 'qs'
import request from "data/utils/request"
import API from "data/common/api/moments/heat"

export async function list(params) {
    return request(`${API.list.url}?${qs.stringify(params)}`)
}
