import qs from 'qs'
import request from 'community/utils/request'
import API from 'community/common/api/keyword/autoReplyKeyword'
import Helper from "community/utils/helper"

export async function query(params) {
    return request(`${API.query.url}?${qs.stringify(params)}`)
}
