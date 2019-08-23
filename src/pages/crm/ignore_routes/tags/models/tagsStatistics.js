import {
    stat,
} from 'crm/services/tags'
import {
    search,
} from 'crm/services/customers/customers'
import _ from "lodash"

function getInitParams() {
    return {
        query: '',
        limit: 10,
        offset: 0,
    }
}

function getInitCustomersParams() {
    return {
        tags: [],
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
        customersList: [],
        customersTotal: 0,
        customersCurrent: 1,
        customersParams: getInitCustomersParams(),
    }
}

export default {
    namespace: 'crm_tagsStatistics',
    state: getInitState(),
    subscriptions: {},
    effects: {
        * list({payload, callback}, {select, call, put}) {
            let {
                params,
                current,
            } = yield select(({crm_tagsStatistics}) => crm_tagsStatistics)
            params = {...params, ...payload.params}
            if(payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }

            const res = yield call(stat, params)
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
        * customersList({payload, callback}, {select, call, put}) {
            let {
                customersParams,
                customersCurrent,
            } = yield select(({crm_tagsStatistics}) => crm_tagsStatistics)
            customersParams = {...customersParams, ...payload.params}
            if(payload.page) {
                customersParams.offset = customersParams.limit * (payload.page - 1)
            }

            const res = yield call(search, customersParams)
            if(res && res.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        customersList: res.data,
                        customersParams: customersParams,
                        customersTotal: res.pagination.rows_found,
                        customersCurrent: payload.page === undefined ? customersCurrent : payload.page,
                    },
                })
                callback && callback(res.data)
            }
        },
    },
    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        assignStateByPath(state, action) {
            const payload = action.payload

            const newState = _.cloneDeep(state)
            const oldValue = _.get(newState, payload.path, {})
            _.set(newState, payload.path, _.defaultsDeep({}, payload.value, oldValue))

            return newState
        },
        setStateByPath(state, action) {
            const newState = _.cloneDeep(state)
            const payload = action.payload
            _.set(newState, payload.path, payload.value)

            return newState
        },
        resetState() {
            return getInitState()
        },
        resetParams(state) {
            return {...state, params: getInitParams()}
        },
        resetCustomersParams(state) {
            return {...state, params: getInitCustomersParams()}
        },
    },
}
