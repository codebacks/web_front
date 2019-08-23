import qs from 'qs'
import request from 'utils/request'
import API from 'wx/common/api/uploadSetting'

export async function list(params) {
    return request(`${API.list.url}?${qs.stringify(params)}`)
}

export async function wxDivideOptions(params) {
    return request(`${API.wxDivideOptions.url}?${qs.stringify(params)}`)
}

export async function batchSet(payload) {
    return request(API.batchSet.url, {
        method: API.batchSet.type,
        body: payload.body
    })
}
