/*
 * @Author: sunlzhi 
 * @Date: 2018-11-08 13:36:31 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-11-13 18:27:11
 */

import config from 'setting/config'

const api = {
    invoicesList : {
        url: `${config.apiHost_wu}/api/accounts/invoices`,
        type: 'GET',
    },
    payOrders: {
        url: `${config.apiHost_wu}/api/accounts/orders`,
        type: 'GET',
    },
    taxpayers: {
        url: `${config.apiHost_wu}/api/accounts/taxpayers`,
        type: 'GET',
    },
    addTaxpayers: {
        url: `${config.apiHost_wu}/api/accounts/taxpayers`,
        type: 'POST',
    },
    putTaxpayers: {
        url: `${config.apiHost_wu}/api/accounts/taxpayers/{id}`,
        type: 'PUT',
    },
    taxpayersDetails: {
        url: `${config.apiHost_wu}/api/accounts/taxpayers/{id}`,
        type: 'GET',
    },
    deleteTaxpayers: {
        url: `${config.apiHost_wu}/api/accounts/taxpayers/{id}`,
        type: 'DELETE',
    },
    addInvoices: {
        url: `${config.apiHost_wu}/api/accounts/invoices`,
        type: 'POST',
    },
    putInvoices: {
        url: `${config.apiHost_wu}/api/accounts/invoices/{id}`,
        type: 'PUT',
    },
    withdrawInvoices: {
        url: `${config.apiHost_wu}/api/accounts/invoices/{id}/cancel`,
        type: 'POST',
    },
    getInvoices: {
        url: `${config.apiHost_wu}/api/accounts/invoices/{id}`,
        type: 'GET',
    },
    getInvoicesOrders: {
        url: `${config.apiHost_wu}/api/accounts/invoices/{id}/orders`,
        type: 'GET',
    },
    getExpress: {
        url: `${config.apiHost_wu}/api/accounts/invoices/{id}/express`,
        type: 'GET',
    },
}

export default api