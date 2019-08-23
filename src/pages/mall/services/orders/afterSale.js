import request from 'mall/utils/request'
import api from 'mall/common/api/orders/afterSale'
import { stringify } from 'qs'

export async function getAfterOrderList(params) {
    return request(`${api.getAfterOrderList.url}?${stringify(params)}`,null,{returnResponse: true})
}

export async function getAfterDetail(params) {
    return request(`${api.getAfterOrderList.url}/${params.id}`)
}

export async function editAfterOrder(params) {
    return request(`${api.editAfterOrder.url}/${params.id}`,{method: api.editAfterOrder.type, body: params},{returnResponse: true})
}

