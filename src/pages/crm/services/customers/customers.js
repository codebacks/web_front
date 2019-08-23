import request from 'crm/utils/request'
import Helper from 'crm/utils/helper'
import API from 'crm/common/api/customer'
import qs from 'qs'

export async function query(params) {
    return request(`${Helper.format(API.LIST.url)}?${qs.stringify(params)}`)
}

export async function detail(params) {
    return request(`${Helper.format(API.DETAIL.url, {id: params.id})}?${qs.stringify(params)}`)
}

export async function plans(params) {
    return request(`${Helper.format(API.CUSTOMER_PLANS.url, {id: params.id})}?${qs.stringify(params)}`)
}

export async function stat(params) {
    return request(`${Helper.format(API.STAT.url, {id: params.id})}?${qs.stringify(params)}`)
}

export async function search(params) {
    return request(API.SEARCH.url, {
        method: API.SEARCH.type,
        body: params
    })
}

export async function planCustomers(data) {
    return request(Helper.format(API.PLAN_CUSTOMERS.url, {id: data.id}), {
        method: API.PLAN_CUSTOMERS.type,
        body: data
    })
}

export async function customerDetail(params) {
    return request(Helper.format(API.CUSTOMER_DETAIL.url, {id: params.id}))
}

export async function exportCustomers(params) {
    return request(`${API.EXPORT_CUSTOMERS.url}?token=${params.token}&`, {
            method: API.EXPORT_CUSTOMERS.type,
            body: params
        },
        {errorShow: false}
    )
}

export async function downloadExportCustomers(params) {
    return request(Helper.format(API.DOWNLOAD_EXPORT_CUSTOMERS.url, {task_id: params.task_id}), {
            method: API.DOWNLOAD_EXPORT_CUSTOMERS.type,
        },
        {returnResponse: true}
    )
}

export async function queryExportCustomers(params) {
    return request(Helper.format(API.QUERY_EXPORT_CUSTOMERS.url, {task_id: params.task_id}), {
            method: API.QUERY_EXPORT_CUSTOMERS.type,
        },
    )
}

// 检查是否有群发次数
export async function checkMass() {
    return request(API.checkMass.url)
}