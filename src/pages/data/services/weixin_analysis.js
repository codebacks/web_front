import request from 'data/utils/request'
import { stringify } from 'qs'
import Helper from 'data/utils/helper'
import api from 'data/common/api/weixin_analysis'

export async function getWechatReport(params) {
    return request(`${api.getWechatReport.url}`, {
        method: api.getWechatReport.type,
        body: params,
    })
}

export async function getReportList(params) {
    return request(`${api.getReportList.url}?${stringify(params)}`)
}

export async function tryReportAgain(params) {
    return request(Helper.format(`${api.tryReportAgain.url}`, {id: params.id}), {
        method: api.tryReportAgain.type,
        body: params,
    })
}
