import request from '../utils/request'
import qs from 'qs'
import Helper from '../utils/helper'
import API from 'common/api/departments'


export async function queryTreesCurrent(payload) {
    return request(`${Helper.format(API.currentTree.url)}?${qs.stringify(payload)}`)
}

export async function queryTrees(payload) {
    return request(`${Helper.format(API.tree.url)}?${qs.stringify(payload)}`)
}