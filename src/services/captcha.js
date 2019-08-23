import request from 'utils/request'
import api from 'common/api/captcha'
// import {stringify} from 'qs'
// import {format} from 'utils'

export async function check(params, option) {
    return request(api.check.url, {
        method: api.check.type,
        body: params,
    }, option)
}

