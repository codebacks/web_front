

import request from '../utils/request'
import api from '../common/api/template_settings'
import Helper from 'utils/helper'

export async function template_messages(params) {
    return request(`${api.template_messages.url}`)
}

export async function open_messages(params) {
    return request(Helper.format(api.open_messages.url, {id: params.id}), {
        method: api.open_messages.type,
        body: params,
    })
}

export async function close_messages(params) {
    return request(Helper.format(api.close_messages.url, {id: params.id}), {
        method: api.close_messages.type,
        body: params,
    })
}

export async function templateMessagesDetail(params) {
    return request(Helper.format(api.templateMessagesDetail.url,params))
}

export async function putTemplateMessages(params) {
    return request(Helper.format(api.putTemplateMessages.url, {id: params.id}), {
        method: api.putTemplateMessages.type,
        body: params,
    })
}

export async function messageHistories(params) {
    return request(Helper.format(api.messageHistories.url,params))
}

export async function messageHistoriesDetail(params) {
    return request(Helper.format(api.messageHistoriesDetail.url,params))
}
