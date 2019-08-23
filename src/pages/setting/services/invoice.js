/*
 * @Author: sunlzhi 
 * @Date: 2018-11-08 13:35:49 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-11-13 20:29:02
 */

import {stringify} from 'qs'
import request from 'setting/utils/request'
import api from 'setting/common/api/invoice'
import Helper from 'utils/helper'

export async function invoicesList(params) {
    return request(`${api.invoicesList.url}?${stringify(params)}`)
}

export async function payOrders(params) {
    return request(`${api.payOrders.url}?${stringify(params)}`)
}

export async function taxpayers(params) {
    return request(`${api.taxpayers.url}?${stringify(params)}`)
}

export async function addTaxpayers(params) {
    return request(api.addTaxpayers.url, {
        method: api.addTaxpayers.type,
        body: params,
    })
}

export async function putTaxpayers(params) {
    return request(Helper.format(api.putTaxpayers.url, {id: params.id}), {
        method: api.putTaxpayers.type,
        body: params,
    })
}

export async function taxpayersDetails(params) {
    return request(Helper.format(api.taxpayersDetails.url, {id: params.id}))
}

export async function deleteTaxpayers(params) {
    return request(Helper.format(api.deleteTaxpayers.url, {id: params.id}), {
        method: api.deleteTaxpayers.type,
        body: params,
    })
}

export async function addInvoices(params) {
    return request(api.addInvoices.url, {
        method: api.addInvoices.type,
        body: params,
    })
}

export async function putInvoices(params) {
    return request(Helper.format(api.putInvoices.url, {id: params.id}), {
        method: api.putInvoices.type,
        body: params,
    })
}

export async function withdrawInvoices(params) {
    return request(Helper.format(api.withdrawInvoices.url, {id: params.id}), {
        method: api.withdrawInvoices.type,
        body: params,
    })
}

export async function getInvoices(params) {
    return request(Helper.format(api.getInvoices.url, {id: params.id}))
}

export async function getInvoicesOrders(params) {
    return request(Helper.format(api.getInvoicesOrders.url, {id: params.id}))
}

export async function getExpress(params) {
    return request(Helper.format(api.getExpress.url, {id: params.id}))
}

