import request from 'utils/request'
import api from 'common/api/shop_fitment'

export async function getProductList(params) {
    return request(api.getProductList.url, {
        method: api.getProductList.type,
        body: params
    })
}

export async function setShop(params) {
    return request(api.setShop.url, {
        method: api.setShop.type,
        body: params
    })
}

export async function getShop(params) {
    return request(api.getShop.url)
}

export async function getCurrentTemplate() {
    return request(api.getCurrentTemplate.url)
}

export async function getTemplateList() {
    return request(api.getTemplateList.url)
}
