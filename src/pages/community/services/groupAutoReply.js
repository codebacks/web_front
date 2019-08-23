import request from 'community/utils/request'
import api from 'community/common/api/groupAutoReply'
import {format} from 'utils'
import qs from 'qs'

export async function autoReply(params) {
    return request(`${format(api.autoReply.url)}?${qs.stringify(params)}`)
}

export async function category(params) {
    return request(`${format(api.category.url, {category_id: params.category_id})}?${qs.stringify(params)}`)
}

export async function getAutoReplyOne(params) {
    return request(`${format(api.getAutoReplyOne.url, {
        uin: params.uin,
        group_username: params.group_username,
    })}?${qs.stringify(params)}`)
}

export async function categoryUpdate(params) {
    return request(format(api.categoryUpdate.url), {
        method: api.categoryUpdate.type,
        body: params,
    })
}

export async function categoryDelete(params) {
    return request(format(api.categoryDelete.url, {category_id: params.category_id}), {
        method: api.categoryDelete.type,
        body: params,
    })
}

export async function autoReplyOneUpdate(params) {
    return request(format(api.autoReplyOneUpdate.url, {uin: params.uin}), {
        method: api.autoReplyOneUpdate.type,
        body: params,
    })
}
