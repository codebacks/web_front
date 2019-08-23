import request from 'crm/utils/request'
import Helper from 'crm/utils/helper'
import API from 'crm/common/api/plan'
import qs from 'qs'

export async function query(params) {
    return request(`${Helper.format(API.LIST.url)}?${qs.stringify(params)}`)
}

export async function create(params) {
    return request(API.CREATE.url, {
        method: API.CREATE.type,
        body: params
    })
}

export async function detail(params) {
    return request(Helper.format(API.DETAIL.url, {id: params.id}))
}

export async function customers(params) {
    return request(Helper.format(API.CUSTOMERS.url, {id: params.id}))
}

export async function remove(params) {
    return request(Helper.format(API.REMOVE.url, {id: params.id}), {
        method: API.REMOVE.type,
        body: params,
    })
}

export async function removeCustomer(params) {
    return request(Helper.format(API.REMOVE_CUSTOMER.url, {plan_id: params.plan_id, customer_id: params.customer_id}), {
        method: API.REMOVE_CUSTOMER.type,
        body: params,
    })
}

export async function modify(data) {
    return request(Helper.format(API.UPDATE.url, {id: data.id}), {
        method: API.UPDATE.type,
        body: data
    })
}