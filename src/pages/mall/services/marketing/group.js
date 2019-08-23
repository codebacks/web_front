import request from 'mall/utils/request'
import api from 'mall/common/api/marketing/group'
import { stringify } from 'qs'

export async function getGoodsList(params) {
    return request(`${api.getGoodsList.url}?${stringify(params)}`,null,{returnResponse: true})
}

export async function selectGoods(params) {
    return request(`${api.selectGoods.url}?status=1&${stringify(params)}`,null,{returnResponse:true})
}

export async function goodDetail(params) {
    return request(`${api.selectGoods.url}/${params.id}`)
}

export async function groupDetail(params) {
    return request(`${api.groupDetail.url}/${params.id}`)
}

export async function editGroup(params) {
    return request(`${api.editGroup.url}/${params.id}`,{method: api.editGroup.type, body: params.params})
}

export async function deleteGroup(params) {
    return request(`${api.deleteGroup.url}/${params.id}`,{method: api.deleteGroup.type},{returnResponse:true})
}

export async function addGroup(params) {
    return request(`${api.addGroup.url}`,{method: api.addGroup.type, body: params})
}

export async function closeGroup(params) {
    return request(`${api.addGroup.url}/${params.id}/close`,{method: api.addGroup.type})
}