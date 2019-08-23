//封装的请求方法
import request from 'mall/utils/request'
//请求地址
import api from 'mall/common/api/approval'
import {stringify} from 'qs'



//获取审批列表
export async function getApprovalList(params) {
    const { page } = params
    let newParams = {}
    if(page){
        newParams = Object.assign({},params,{page: params.page - 1})
    }else{
        newParams = params
    }
    return request(`${api.getApprovalList.url}?${stringify(newParams)}`,null,{returnResponse: true})
}

export async function changeCommentStatus (params) {
    const { page } = params
    let newParams = {}
    if(page){
        newParams = Object.assign({},params,{page: params.page - 1})
    }else{
        newParams = params
    }
    return request(`${api.changeCommentStatus.url}/${newParams.id}`,{
        method: api.changeCommentStatus.type,
        body: newParams,
    },null,{returnResponse: true})
}