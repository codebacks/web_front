
import request from 'setting/utils/request'
import api from 'setting/common/api/developer'

export async function getDevelopInfo(params) {
    return request(`${api.getDevelopInfo.url}`)
}

export async function newDevelopInfo(params){
    return request(`${api.newDevelopInfo.url}`, {
        method: api.newDevelopInfo.type,
        body: params,
    })
}

export async function resetDevelopInfo(params){
    return request(`${api.resetDevelopInfo.url}`, {
        method: api.resetDevelopInfo.type,
        body: params,
    })
}


