import api from '../common/api/kepler_program'
import request from '../utils/request'
import { stringify } from 'qs'

export async function getKeplerCardList(params) {
    return request(`${api.getKeplerCardList.url}?${stringify(params)}`)
}

export async function getGroupList(params) {
    return request(`${api.getGroupList.url}?${stringify(params)}`)
}

export async function addGroup(params) {
    return request(`${api.addGroup.url}`, {body: params, method: api.addGroup.type})
}

export async function createCard(params) {
    return request(`${api.createCard.url}`, {body: params, method: api.createCard.type})
}

export async function cardDetail(id) {
    return request(`${api.createCard.url}/${id}`)
}

export async function deleteCard(id) {
    return request(`${api.createCard.url}/${id}`, {method: api.deleteCard.type})
}

export async function editCardConfig(params) {
    return request(`${api.cardConfig.url}`, {method: api.cardConfig.type, body: params})
}

export async function getCardConfig() {
    return request(`${api.cardConfig.url}`)
}

export async function moveCardGroup(params) {
    return request(`${api.moveCardGroup.url}/${params.id}/categories`, {method: api.moveCardGroup.type, body: params})
}