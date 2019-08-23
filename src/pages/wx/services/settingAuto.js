import request from 'wx/utils/request'
import api from 'wx/common/api/settingAuto'
import {format} from 'utils'
import qs from 'qs'

export async function setting(params) {
    return request(`${format(api.setting.url)}?${qs.stringify(params)}`)
}

export async function settingUpdate(params) {
    return request(format(api.settingUpdate.url), {
        method: api.settingUpdate.type,
        body: params,
    })
}
