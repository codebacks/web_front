import request from 'data/utils/request'
import Helper from 'data/utils/helper'
import API from 'data/common/api/business'
import qs from 'qs'

export async function query(params) {
    return request(`${Helper.format(API.reports.url)}?${qs.stringify(params)}`)
}

export async function queryFriendsReports(params) {
    return request(`${Helper.format(API.friendsReports.url)}?${qs.stringify(params)}`)
}

export async function queryWechatsReportsOverview(params) {
    return request(`${Helper.format(API.wechatsReportsOverview.url)}?${qs.stringify(params)}`)
}

export async function queryWechatsReports(params) {
    return request(`${Helper.format(API.wechatsReports.url)}?${qs.stringify(params)}`)
}
