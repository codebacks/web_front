
import request from '../../mall/utils/request'
import api from '../common/api/setting'
import {stringify} from 'qs'

export async function getSettingData(params) {
    return request(`${api.getSettingData.url}`)
}

export async function saveSettingData(params) {
    return request(`${api.saveSettingData.url}`, {
        method: api.saveSettingData.type,
        body: params,
    })
}

export async function saveSharingData(params) {
    return request(`${api.saveSharingData.url}`, {
        method: api.saveSettingData.type,
        body: params,
    })
}

export async function addExperie(params) {
    return request(`${api.addExperie.url}`, {
        method: api.addExperie.type,
        body: params,
    })
}

export async function deleteExperie(params) {
    return request(`${api.deleteExperie.url}`, {
        method: api.deleteExperie.type,
        body: params,
    })
}

export async function getExperieList(params) {
    const { page } = params
    let newParams = {}
    if(page){
        newParams = Object.assign({},params,{page: params.page - 1})
    }else{
        newParams = params
    }
    return request(`${api.getExperieList.url}?${stringify(newParams)}`,null,{returnResponse: true})
}


export async function getMpaAudit(params) {
    return request(`${api.getMpaAudit.url}`)
}

export async function subMpaAudit(params) {
    return request(`${api.subMpaAudit.url}`, {
        method: api.subMpaAudit.type,
        body: params,
    })
}

export async function getMpaHistory(params) {
    return request(`${api.getMpaHistory.url}`)
}