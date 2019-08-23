
import {stringify} from 'qs'
import request from '../utils/request'
import api from '../common/api/send_record'
import Helper from 'utils/helper'

export async function messageHistories(params) {
    return request(api.messageHistories.url+ '?' + stringify(params))
}

export async function messageHistoriesDetail(params) {
    return request(Helper.format(api.messageHistoriesDetail.url,params))
}
