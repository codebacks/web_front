//封装的请求方法
import request from 'mall/utils/request'
//请求地址
import api from 'mall/common/api/category'
import {stringify} from 'qs'
import _ from 'lodash'


export async function getCategory(params) {
    return request(`${api.getCategory.url}`)
}
export async function addCategory(params) {
    return request(`${api.addCategory.url}`,{
        method: api.addCategory.type,
        body: params, 
    })
}
export async function deleteCategory(params) {
    return request(`${api.deleteCategory.url}/${params.id}`,{
        method: api.deleteCategory.type,
        body: params, 
    })
}
export async function updateCategory(params) {
    return request(`${api.updateCategory.url}/${params.id}`,{
        method: api.updateCategory.type,
        body: params, 
    })
}
