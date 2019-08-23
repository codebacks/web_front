import request from 'wx/utils/request'
import api from 'wx/common/api/watermark'
import {format} from 'utils'
import qs from 'qs'

export async function watermark(params) {
    return request(`${format(api.watermark.url)}?${qs.stringify(params)}`)
}

export async function updateWatermark(params) {
    return request(format(api.updateWatermark.url), {
        method: api.updateWatermark.type,
        body: params,
    })
}