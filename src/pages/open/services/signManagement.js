import qs from 'qs'
import request from '../utils/request'
import Helper from '../utils/helper'
import API from 'platform/common/api/signManagement'



export async function getSignTemplateList(params) {
    return request(`${API.getSignTemplateList.url}?${qs.stringify(params)}`)
}

export async function getShopList(params) {
    return request(`${Helper.format(API.getShopList.url)}?${qs.stringify(params)}`)
}

export async function postSignTemplate(params) {
    return request(Helper.format(API.postSignTemplate.url), {
        method: API.postSignTemplate.type,
        body: params
    })
}

export async function deleteSignTemplate(params) {
    return request(Helper.format(API.deleteSignTemplate.url + params), {
        method: API.deleteSignTemplate.type,
        // body: params
    })
}

export const SIGN_TYPE = [{
    label: '公司',
    key: '1'
}, {
    label: '媒体、报社、学校、医院，机关事业单位名称',
    key: '2'
}, {
    label: '自己产品名/网站名/APP名称等',
    key: '3'
}, {
    label: '他人产品名/网站名等',
    key: '4'
}]