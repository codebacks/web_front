/*
 * @Author: sunlzhi 
 * @Date: 2018-11-01 16:40:23 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-11-16 11:36:38
 */

import {invoicesList, payOrders, taxpayers, addTaxpayers, putTaxpayers, taxpayersDetails, deleteTaxpayers, addInvoices, putInvoices, withdrawInvoices, getInvoices, getInvoicesOrders, getExpress} from 'setting/services/invoice'

export default {
    namespace: 'invoice',

    state: {
        invoicesData: [],
        invoicesDataPagination: {},
        payOrdersData: [],
        payOrdersPagination: {},
        taxpayersData: [],
        taxpayersPagination: {},
        taxpayersDetails: {},
        invoiceDetail: {},
        invoicesOrdersList: [],
        invoicesOrdersPagination: {},
        expressData: {},
    },

    effects: {
        * invoicesList({payload, callback}, {select, call, put}) {
            const {data, pagination} = yield call(invoicesList, payload)

            if(data) {
                yield put({type: 'setProperty', payload: {invoicesData: data, invoicesDataPagination: pagination}})
                callback && callback(data)
            }
        },
        * payOrders({payload, callback}, {select, call, put}) {
            const {data, pagination} = yield call(payOrders, payload)

            if(data) {
                yield put({type: 'setProperty', payload: {payOrdersData: data, payOrdersPagination: pagination}})
                callback && callback(data)
            }
        },
        * taxpayers({payload, callback}, {select, call, put}) {
            const {data, pagination} = yield call(taxpayers, payload)

            if(data) {
                yield put({type: 'setProperty', payload: {taxpayersData: data, taxpayersPagination: pagination}})
                callback && callback(data)
            }
        },
        * addTaxpayers({payload, callback}, {select, call, put}) {
            const {data, meta} = yield call(addTaxpayers, payload)

            if(meta.code === 200) {
                callback && callback(data)
            }
        },
        * putTaxpayers({payload, callback}, {select, call, put}) {
            const {data, meta} = yield call(putTaxpayers, payload)

            if(meta.code === 200) {
                callback && callback(data)
            }
        },
        * taxpayersDetails({payload, callback}, {select, call, put}) {
            const {data} = yield call(taxpayersDetails, payload)

            if(data) {
                yield put({type: 'setProperty', payload: {taxpayersDetails: data}})
                callback && callback(data)
            }
        },
        * deleteTaxpayers({payload, callback}, {select, call, put}) {
            const {data, meta} = yield call(deleteTaxpayers, payload)

            if(meta.code === 200) {
                callback && callback(data)
            }
        },
        * addInvoices({payload, callback}, {select, call, put}) {
            const {data, meta} = yield call(addInvoices, payload)

            if(meta.code === 200) {
                callback && callback(data)
            }
        },
        * putInvoices({payload, callback}, {select, call, put}) {
            const {data, meta} = yield call(putInvoices, payload)

            if(meta.code === 200) {
                callback && callback(data)
            }
        },
        * withdrawInvoices({payload, callback}, {select, call, put}) {
            const {data} = yield call(withdrawInvoices, payload)

            callback && callback(data)
        },
        * getInvoices({payload, callback}, {select, call, put}) {
            const {data} = yield call(getInvoices, payload)

            if(data) {
                yield put({type: 'setProperty', payload: {invoiceDetail: data}})
                callback && callback(data)
            }
        },
        * getInvoicesOrders({payload, callback}, {select, call, put}) {
            const {data, pagination} = yield call(getInvoicesOrders, payload)

            if(data) {
                yield put({type: 'setProperty', payload: {invoicesOrdersList: data, invoicesOrdersPagination: pagination}})
                callback && callback(data)
            }
        },
        * getExpress({payload, callback}, {select, call, put}) {
            const {data} = yield call(getExpress, payload)

            if(data) {
                yield put({type: 'setProperty', payload: {expressData: data}})
                callback && callback(data)
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
    },
}
