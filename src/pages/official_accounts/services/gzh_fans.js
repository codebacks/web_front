import request from '../utils/request'
import api from '../common/api/gzh_fans'
import {stringify} from 'qs'
import Helper from 'utils/helper'

export async function getFanStatic(params) {
    return request(Helper.format(api.getFanStatic.url,{app_id:params.app_id}))
}

export async function getFanList(params) {
    return request(Helper.format(api.getFanList.url,{app_id:params.app_id}) + '?' + stringify(params))
}

export async function getAppId(params) {
    return request(api.getAppId.url)
}