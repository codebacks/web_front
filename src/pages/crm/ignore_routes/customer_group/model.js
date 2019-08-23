import {
    customerGroups,
    details,
    createCustomerGroups,
    customersDetails,
    customersFilter,
    editCustomerGroups,
    deleteCustomerGroups,
} from 'crm/services/customerGroups'
import moment from "moment"
import createModel from 'utils/model'
import _ from "lodash"

function getInitParams() {
    return {
        query: '',
        create_time: [null, null],
        limit: 10,
        offset: 0,
    }
}

function getInitDetailParams() {
    return {
        limit: 10,
        offset: 0,
    }
}

function getInitState() {
    return {
        list: [],
        params: getInitParams(),
        total: 0,
        current: 1,
        detailParams: getInitDetailParams(),
        detailList: [],
        detailTotal: 0,
        detailCurrent: 1,
    }
}

export default createModel({
    namespace: 'crm_customerGroup',
    state: getInitState(),
    effects: {
        * list({payload, callback}, {select, call, put}) {
            let {
                params,
                current,
            } = yield select(({crm_customerGroup}) => crm_customerGroup)

            params = {...params, ...payload.params}
            if(payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            let query = {...params, ...params.status}

            query.create_time = `${params.create_time[0] ? `${moment(params.create_time[0]).format('YYYY-MM-DD')}  00:00:00` : ''},${params.create_time[1] ? `${moment(params.create_time[1]).format('YYYY-MM-DD')} 23:59:59` : ''}`

            const res = yield call(customerGroups, query)
            if(res && res.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: res.data,
                        params: params,
                        total: res.pagination.rows_found,
                        current: payload.page === undefined ? current : payload.page,
                    },
                })
                callback && callback(res.data)
            }
        },
        * customersDetails({payload, callback}, {select, call, put}) {
            let {
                detailParams,
                detailCurrent,
            } = yield select(({crm_customerGroup}) => crm_customerGroup)
            detailParams = {...detailParams, ...payload.params}
            if(payload.params.page) {
                detailParams.offset = detailParams.limit * (payload.params.page - 1)
            }

            let callServices

            if(payload.callType === 1) {
                callServices = customersDetails
            }else if(payload.callType === 2) {
                callServices = customersFilter
            }

            const data = yield call(callServices, detailParams)

            if(data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        detailList: data.data,
                        detailParams: detailParams,
                        detailTotal: _.get(data, 'pagination.rows_found'),
                        detailCurrent: payload.params.page === undefined ? detailCurrent : payload.params.page,
                    },
                })
            }
        },
        * createCustomerGroups({payload, callback}, {select, call, put}) {
            const {meta, data} = yield call(createCustomerGroups, payload)
            if(meta && meta.code === 200) {
                callback && callback(data)
            }
        },
        * editCustomerGroups({payload, callback}, {select, call, put}) {
            const {meta, data} = yield call(editCustomerGroups, payload)
            if(meta && meta.code === 200) {
                callback && callback(data)
            }
        },
        * deleteCustomerGroups({payload, callback}, {select, call, put}) {
            const {meta, data} = yield call(deleteCustomerGroups, payload)
            if(meta && meta.code === 200) {
                callback && callback(data)
            }
        },
        * details({payload, callback}, {select, call, put}) {
            const {data} = yield call(details, payload)
            if(data) {
                callback && callback(data)
            }
        },
    },
    reducers: {
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        resetParams(state, action) {
            return {...state, params: getInitParams()}
        },
        resetDetailParams(state, action) {
            return {...state, detailParams: getInitDetailParams()}
        },
    },
})

