import request from '../utils/request'
import API from 'platform/common/api/zww_survey'

export async function getAccountStatus(params) {
    return request(`${API.getAccountStatus.url}`)
}

export async function openService(params) {
    return request(`${API.openService.url}`, { 
        method: API.openService.type
    })
}

