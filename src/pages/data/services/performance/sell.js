import request from 'data/utils/request'
import Helper from 'data/utils/helper'
import api from 'data/common/api/sell'
import {stringify} from 'qs'


export async function getShopListOauth(params) {
    return request(`${api.getShopListOauth.url}?${stringify(params)}`)
}

export async function querySellData(params) {
    return request(`${Helper.format(api.querySellData.url)}?${stringify(params)}`)
}

export async function downloadSell(params) {
    return request(`${Helper.format(api.downloadSell.url)}?${stringify(params)}`)
}
export async function getTranslateSet(params) {
    return request(Helper.format(api.getTranslateSet.url))
}
export async function getPerformanceDetail(params) {
    return request(`${Helper.format(api.getPerformanceDetail.url)}?${stringify(params)}`)
}

export async function setTranslateSet(params) {
    return request(Helper.format(api.setTranslateSet.url),{
        method:api.setTranslateSet.type,
        body:params
    })
}

export async function queryUpdateStatus(params) {
    return request(`${Helper.format(api.queryUpdateStatus.url)}?${stringify(params)}`)
}

export async function updateDataList(params) {
    return request(`${Helper.format(api.updateDataList.url)}?${stringify(params)}`)
}

export async function createStatementList(params) {
    return request(`${Helper.format(api.createStatementList.url)}?${stringify(params)}`)
}

export async function updateData(params) {
    return request(Helper.format(api.updateData.url),{
        method:api.updateData.type,
        body:params
    })
}
 
export async function createAgain(params) {
    return request(Helper.format(api.createAgain.url,{id:params.id}),{
        method:api.createAgain.type,
        body:params
    })
}


export async function createStatement(params) {
    return request(Helper.format(api.createStatement.url),{
        method:api.createStatement.type,
        body:params
    })
}