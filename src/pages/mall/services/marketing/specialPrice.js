import request from 'mall/utils/request'
import api from 'mall/common/api/marketing/specialPrice'
import { stringify } from 'qs'

export async function getGoodsList(params) {
    return request(`${api.getGoodsList.url}?${stringify(params)}`)
}

export async function modifyRank(params) {
    return request(`${api.modifyRank.url}`,{method: api.modifyRank.type,body: params},{returnResponse:true})
}

export async function searchGoodsList(params) {
    return request(`${api.searchGoodsList.url}?${stringify(params)}`,null,{returnResponse:true})
}

export async function editGoodInfo(params) {
    return request(`${api.editGoodInfo.url}/${params.id}`)
}

export async function saveNewGood(params) {
    return request(`${api.saveNewGood.url}`,{method: api.saveNewGood.type,body: params})
}

export async function saveEditGood(params) {
    return request(`${api.saveEditGood.url}/${params.id}`,{method: api.saveEditGood.type,body: params})
}

export async function deleteSpecial(params) {
    return request(`${api.deleteSpecial.url}/${params.id}`,{method: api.deleteSpecial.type},{returnResponse:true})
}