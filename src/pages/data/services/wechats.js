import request from 'data/utils/request'
import qs from 'qs'
import Helper from 'data/utils/helper'
import API from 'data/common/api/wechats'

export async function messages(payload) {
    return request(`${Helper.format(API.messages.url, {uin: payload.from_uin})}?${qs.stringify(payload)}`)
}
