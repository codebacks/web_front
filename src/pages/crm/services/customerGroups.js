import request from 'crm/utils/request'
import api from 'crm/common/api/customerGroups'
import {format} from 'utils'
import qs from 'qs'

export async function customerGroups(params) {
    return request(`${format(api.customerGroups.url)}?${qs.stringify(params)}`)
}

export async function details(params) {
    return request(`${format(api.details.url, {id: params.id})}?${qs.stringify(params)}`)
}

export async function customersDetails(params) {
    return request(`${format(api.customersDetails.url, {id: params.id})}?${qs.stringify(params)}`)
}

export async function createCustomerGroups(params) {
    return request(format(api.createCustomerGroups.url), {
        method: api.createCustomerGroups.type,
        body: params,
    })
}

export async function editCustomerGroups(params) {
    return request(format(api.editCustomerGroups.url, {id: params.id}), {
        method: api.editCustomerGroups.type,
        body: params,
    })
}

export async function deleteCustomerGroups(params) {
    return request(format(api.deleteCustomerGroups.url, {id: params.id}), {
        method: api.deleteCustomerGroups.type,
        body: params,
    })
}

export async function customersFilter(params) {
    return request(format(api.customersFilter.url), {
        method: api.customersFilter.type,
        body: params,
    })
}



