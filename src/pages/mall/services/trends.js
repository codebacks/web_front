//封装的请求方法
import request from 'mall/utils/request'
//请求地址
import api from 'mall/common/api/trends'
import {stringify} from 'qs'
import _ from 'lodash'


//添加短动态
export async function addShortTrend(params) {
    return request(`${api.addShortTrend.url}`, {
        method: api.addShortTrend.type,
        body: params,
    })
}

//添加长动态
export async function addLongTrend(params) {
    return request(`${api.addLongTrend.url}`, {
        method: api.addLongTrend.type,
        body: params,
    })
}

//获取动态列表
export async function getTrendList(params) {
    const { page } = params
    let newParams = {}
    if(page){
        newParams = Object.assign({},params,{page: params.page - 1})
    }else{
        newParams = params
    }
    return request(`${api.getTrendList.url}?${stringify(newParams)}`,null,{returnResponse: true})
}

//获取指定动态详情
export async function getTrendDetail(params) {
    return request(`${api.getTrendDetail.url}/${params.id}`)
}

//获取指定动态详情
export async function deleteTrend(params) {
    return request(`${api.deleteTrend.url}/${params.id}`,{
        method: api.deleteTrend.type,
    })
}

export async function updateTrend(params) {
    return request(`${api.updateTrend.url}/${params.id}`,{
        method: api.updateTrend.type,
        body: params,
    })
}

export async function getTrendComment (params) {
    const { page } = params
    let newParams = {}
    if(page){
        newParams = Object.assign({},params,{page: params.page - 1})
    }else{
        newParams = params
    }
    return request(`${api.getTrendComment.url}?${stringify(newParams)}`,null,{returnResponse: true})
}

export async function postComment(params) {
    return request(`${api.postComment.url}`,{
        method: api.postComment.type,
        body: params,
    })
}