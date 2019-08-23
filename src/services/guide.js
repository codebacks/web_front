import { stringify } from 'qs'
import request from 'utils/request'
import api from 'common/api/guide'

// 引导
export async function guidances(params) {
    return request(`${api.guidances.url}?${stringify(params)}`)
}

export async function hideGuidances(params) {
    return request(`${api.hideGuidances.url}?${stringify(params)}`)
}