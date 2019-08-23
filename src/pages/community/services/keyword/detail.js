import qs from 'qs'
import request from 'community/utils/request'
import API from 'community/common/api/keyword/detail'
import Helper from "community/utils/helper"

export async function list(payload) {
    return request(`${Helper.format(API.list.url, {row_id: payload.id})}?${qs.stringify(payload.params)}`)
}