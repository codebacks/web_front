import {parse} from 'qs'
import moment from 'moment'
import config from 'crm/common/config'
import {query, create, detail,
    // resend, pause, resume,
    remove, modify, customers,removeCustomer} from 'crm/services/customers/plan'

const {DateFormat} = config

const params = {
    limit: 10,
    offset: 0,
    query: '',
    start_time: moment().subtract(60, 'days').format(DateFormat) + ' 00:00:00',
    end_time: moment().format(DateFormat) + ' 23:59:59',
}
export default {
    namespace: 'crm_plans',
    state: {
        list: [],
        loading: false, //加载角色列表
        params: {...params},
        current: 1,
        total: 0,
        record: {},
        createModal: false,
        editLoading: false,
        customers: [], //详情列表,查看
        toCustomers: [] //创建时客户列表可删
    },

    subscriptions: {},

    effects: {
        * query({payload, callback}, {select, call, put}) {
            yield put({type: 'setProperty', payload: {loading: true}})
            let params = yield select(({crm_plans}) => crm_plans.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(query, parse(params))
            if (data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        list: data.data,
                        params: params,
                        total: data.pagination.rows_found,
                        current: payload.page === undefined ? 1 : payload.page
                    }
                })
                callback && callback(data.data)
            } else {
                yield put({type: 'setProperty', payload: {loading: false}})
            }
        },
        * create({payload, callback}, {call, put}) {
            yield put({type: 'setProperty', payload: {createLoading: true}})
            const data = yield call(create, parse(payload))
            if (data && data.data) {
                callback && callback()
            }
            yield put({type: 'setProperty', payload: {createLoading: false}})
        },
        * detail({payload, callback}, {call, put}) {
            yield put({type: 'setProperty', payload: {detailLoading: true}})
            const data = yield call(detail, parse(payload))
            if (data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        record: data.data
                    }
                })
                callback && callback(data.data)
            }
            yield put({type: 'setProperty', payload: {detailLoading: false}})
        },
        * remove({payload, callback}, {call, put}) {
            const data = yield call(remove, parse(payload))
            if (data) {
                callback && callback()
            }
        },
        * removeCustomer({payload, callback}, {call, put}) {
            const data = yield call(removeCustomer, parse(payload))
            if (data) {
                callback && callback()
            }
        },
        * queryCustomers({payload, callback}, {call, put}) {
            yield put({type: 'setProperty', payload: {customersLoading: true}})
            const data = yield call(customers, parse(payload))
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        customers: data.data,
                        customersLoading: false
                    }
                })
                callback && callback()
            } else {
                yield put({type: 'setProperty', payload: {customersLoading: false}})
            }
        },
        * modify({payload, callback}, {call, put}) {
            yield put({type: 'setAttribute', payload: {editLoading: true}})
            const data = yield call(modify, parse(payload))
            if (data && data.data) {
                callback && callback()
            }
            yield put({type: 'setAttribute', payload: {editLoading: false}})
        },


    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        setParams(state, action) {
            let params = {...state.params, ...action.payload}
            return {...state, ...{params: params}}
        },
        querySuccess(state, action) {
            return {...state, ...action.payload, loading: false}
        },
        removeCustomer(state, action) {
            let member = Array.from(state.toCustomers)
            member.splice(action.payload.idx, 1)
            return {...state, ...{toCustomers: member}}
        }
    }
}
